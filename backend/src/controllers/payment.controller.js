import crypto from 'crypto'
import prisma from '../config/db.js'

// ── Helper: build eSewa verification message dynamically ──────────
// Sign the EXACT values eSewa sent back — do NOT override product_code
// with the env value (that mismatch is a common cause of failed verification).
const buildEsewaMessage = (decoded) => {
  return decoded.signed_field_names
    .split(',')
    .map((field) => `${field}=${decoded[field]}`)
    .join(',')
}

// ── eSewa ─────────────────────────────────────────────────────────

export const initiateEsewa = async (req, res) => {
  try {
    // ── DEBUG: confirm the URLs eSewa will redirect to ──
    console.log('[esewa] BACKEND_URL  =', process.env.BACKEND_URL)
    console.log('[esewa] success_url  =', `${process.env.BACKEND_URL}/api/payments/esewa/success`)
    console.log('[esewa] failure_url  =', `${process.env.FRONTEND_URL}/payment/failed`)

    const { orderId } = req.body

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { payment: true }
    })

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    if (order.payment) {
      return res.status(400).json({ success: false, message: 'Payment already initiated for this order' })
    }

    const transactionUuid = `NF-${order.id}-${Date.now()}`

    // Canonical amount strings — MUST be byte-for-byte identical in the
    // signature and in the form fields, or eSewa rejects the request and
    // bounces the user straight to failure_url. Whole numbers like 5500
    // break unless forced to a fixed 2-decimal form ("5500.00").
    const amountStr = Number(order.totalAmount).toFixed(2)   // 5500 -> "5500.00"
    const taxStr = '0.00'
    const totalStr = amountStr                               // no tax/charges here

    // eSewa HMAC signature (request) — sign the EXACT strings sent in the form
    const signedFieldNames = 'total_amount,transaction_uuid,product_code'
    const message = `total_amount=${totalStr},transaction_uuid=${transactionUuid},product_code=${process.env.ESEWA_MERCHANT_CODE}`
    const signature = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64')

    // Create pending payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'ESEWA',
        status: 'PENDING',
        transactionId: transactionUuid,
        amount: order.totalAmount
      }
    })

    const formData = {
      amount: amountStr,
      tax_amount: taxStr,
      total_amount: totalStr,
      transaction_uuid: transactionUuid,
      product_code: process.env.ESEWA_MERCHANT_CODE,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${process.env.BACKEND_URL}/api/payments/esewa/success`,
      failure_url: `${process.env.FRONTEND_URL}/payment/failed`,
      signed_field_names: signedFieldNames,
      signature
    }

    console.log('[initiateEsewa] signing message:', message)
    console.log('[initiateEsewa] formData:', formData)

    return res.status(200).json({
      success: true,
      data: {
        esewaUrl: `${process.env.ESEWA_BASE_URL}/api/epay/main/v2/form`,
        formData
      }
    })
  } catch (error) {
    console.error('[initiateEsewa] ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to initiate eSewa payment' })
  }
}

export const esewaSuccess = async (req, res) => {
  const failUrl = `${process.env.FRONTEND_URL}/payment/failed`
  const okUrl   = `${process.env.FRONTEND_URL}/payment/success`

  try {
    // ── DEBUG: if you DON'T see this line after paying, eSewa never reached
    //    your backend → the problem is in initiateEsewa / the request, not here.
    console.log('[esewaSuccess] HIT — query:', req.query)

    const { data } = req.query

    if (!data) {
      console.error('[esewaSuccess] Missing data query param')
      return res.redirect(failUrl)
    }

    // Decode base64 response from eSewa
    let decoded
    try {
      decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
    } catch (parseErr) {
      console.error('[esewaSuccess] Failed to decode/parse eSewa data:', parseErr)
      return res.redirect(failUrl)
    }

    console.log('[esewaSuccess] decoded:', decoded, '| total_amount typeof:', typeof decoded.total_amount)

    const { transaction_uuid, total_amount, status, signed_field_names } = decoded

    if (!transaction_uuid || !total_amount || !status || !signed_field_names) {
      console.error('[esewaSuccess] Missing required fields in decoded data:', decoded)
      return res.redirect(failUrl)
    }

    if (status !== 'COMPLETE') {
      console.error(`[esewaSuccess] eSewa status not COMPLETE: ${status}`)
      return res.redirect(failUrl)
    }

    // Verify signature dynamically from signed_field_names (exact values eSewa sent)
    const message = buildEsewaMessage(decoded)
    const expectedSig = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64')

    if (expectedSig !== decoded.signature) {
      console.error('[esewaSuccess] Signature mismatch!')
      console.error('  Computed message:', message)
      console.error('  Expected sig:', expectedSig)
      console.error('  Received sig:', decoded.signature)
      console.error('  Decoded data:', decoded)
      return res.redirect(failUrl)
    }

    // Look up by OUR uuid — this stays stable, we never overwrite it.
    const payment = await prisma.payment.findFirst({
      where: { transactionId: transaction_uuid }
    })

    if (!payment) {
      console.error(`[esewaSuccess] No payment found for transaction_uuid: ${transaction_uuid}`)
      return res.redirect(failUrl)
    }

    // Idempotent: a repeat callback or a page refresh just lands on success.
    if (payment.status === 'COMPLETED') {
      console.log('[esewaSuccess] Payment already completed — redirecting success')
      return res.redirect(okUrl)
    }

    // Update payment + order atomically
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date()
          // NOTE: transactionId is left as the uuid on purpose — do not clobber it
        }
      })

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' }
      })
    })

    return res.redirect(okUrl)
  } catch (error) {
    console.error('[esewaSuccess] ERROR:', error)
    return res.redirect(failUrl)
  }
}

// ── Cash on Delivery ──────────────────────────────────────────────

export const cashOnDelivery = async (req, res) => {
  try {
    const { orderId } = req.body

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { payment: true }
    })

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    if (order.payment) {
      return res.status(400).json({ success: false, message: 'Payment record already exists' })
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: 'CASH_ON_DELIVERY',
          status: 'PENDING',
          amount: order.totalAmount
        }
      })

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' }
      })
    })

    return res.status(200).json({
      success: true,
      message: 'Order confirmed. Pay on delivery.',
      data: { orderId: order.id }
    })
  } catch (error) {
    console.error('[cashOnDelivery] ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to confirm order' })
  }
}

// ── Admin: All payments ───────────────────────────────────────────

export const adminGetPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: {
          include: { user: { select: { name: true, email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json({ success: true, data: { payments } })
  } catch (error) {
    console.error('[adminGetPayments] ERROR:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}