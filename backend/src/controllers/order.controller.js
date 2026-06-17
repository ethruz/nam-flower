import prisma from '../config/db.js'
import { sendOrderConfirmation } from '../config/email.js'
import { createOrderSchema } from '../validators/order.validator.js'

export const createOrder = async (req, res) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message })
    }

    const { paymentMethod, deliveryAddress, deliveryDate } = parsed.data

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } }
    })

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' })
    }

    // Check stock for all items
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${item.product.name}`
        })
      }
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    // Create order + items + deduct stock atomically
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          paymentMethod,
          deliveryAddress,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: { items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } }
      })

      // Deduct stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return newOrder
    })

    // Send confirmation email (non-blocking)
    prisma.user.findUnique({ where: { id: req.user.id } })
      .then(user => sendOrderConfirmation(order, user))
      .catch(() => {})

    return res.status(201).json({ success: true, message: 'Order placed successfully', data: { order } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error placing order' })
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ success: true, data: { orders } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
        payment: true
      }
    })

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    return res.status(200).json({ success: true, data: { order } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Admin
export const adminGetOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const where = status ? { status } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { id: true, name: true } } } },
          payment: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ])

    return res.status(200).json({ success: true, data: { orders, total } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    })

    return res.status(200).json({ success: true, message: 'Order status updated', data: { order } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}
