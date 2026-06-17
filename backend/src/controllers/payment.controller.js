import crypto from 'crypto'
import prisma from '../config/db.js'

// ── eSewa ─────────────────────────────────────────────────────────

export const initiateEsewa = async (req, res) => {
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
      return res.status(400).json({ success: false, message: 'Payment already initiated for this order' })
    }

    const transactionUuid = `NF-${order.id}-${Date.now()}`
    const amount = order.totalAmount
    const taxAmount = 0
    const totalAmount = amount

    // eSewa HMAC signature
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${process.env.ESEWA_MERCHANT_CODE}`
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
        amount: totalAmount
      }
    })

    const formData = {
      amount: amount.toString(),
      tax_amount: taxAmount.toString(),
      total_amount: totalAmount.toString(),
      transaction_uuid: transactionUuid,
      product_code: process.env.ESEWA_MERCHANT_CODE,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${process.env.BACKEND_URL}/api/payments/esewa/success`,
      failure_url: `${process.env.FRONTEND_URL}/payment/failed`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature
    }

    return res.status(200).json({
      success: true,
      data: {
        esewaUrl: `${process.env.ESEWA_BASE_URL}/api/epay/main/v2/form`,
        formData
      }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to initiate eSewa payment' })
  }
}

export const esewaSuccess = async (req, res) => {
  try {
    const { data } = req.query

    if (!data) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`)
    }

    // Decode base64 response from eSewa
    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
    const { transaction_uuid, total_amount, status } = decoded

    if (status !== 'COMPLETE') {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`)
    }

    // Verify signature
    const message = `transaction_code=${decoded.transaction_code},status=${decoded.status},total_amount=${decoded.total_amount},transaction_uuid=${decoded.transaction_uuid},product_code=${process.env.ESEWA_MERCHANT_CODE},signed_field_names=${decoded.signed_field_names}`
    const expectedSig = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64')

    if (expectedSig !== decoded.signature) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`)
    }

    // Update payment + order atomically
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { transactionId: transaction_uuid }
      })

      if (!payment) throw new Error('Payment not found')

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          transactionId: decoded.transaction_code,
          paidAt: new Date()
        }
      })

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' }
      })
    })

    return res.redirect(`${process.env.FRONTEND_URL}/payment/success`)
  } catch (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`)
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
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}
