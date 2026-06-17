import prisma from '../config/db.js'

const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, price: true, imageUrl: true, stock: true } } }
      }
    }
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, price: true, imageUrl: true, stock: true } } }
        }
      }
    })
  }

  return cart
}

export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id)
    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    return res.status(200).json({ success: true, data: { cart, total } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    if (!productId || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid product or quantity' })
    }

    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } })
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock' })
    }

    const cart = await getOrCreateCart(req.user.id)

    const existingItem = cart.items.find(i => i.productId === parseInt(productId))

    if (existingItem) {
      const newQty = existingItem.quantity + parseInt(quantity)
      if (product.stock < newQty) {
        return res.status(400).json({ success: false, message: 'Not enough stock' })
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty }
      })
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: parseInt(productId), quantity: parseInt(quantity) }
      })
    }

    const updated = await getOrCreateCart(req.user.id)
    const total = updated.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    return res.status(200).json({ success: true, message: 'Added to cart', data: { cart: updated, total } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body
    const itemId = parseInt(req.params.itemId)

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' })
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true }
    })

    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Cart item not found' })
    }
    if (item.product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock' })
    }

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: parseInt(quantity) } })

    const updated = await getOrCreateCart(req.user.id)
    const total = updated.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    return res.status(200).json({ success: true, message: 'Cart updated', data: { cart: updated, total } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const removeCartItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId)

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    })

    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Cart item not found' })
    }

    await prisma.cartItem.delete({ where: { id: itemId } })

    const updated = await getOrCreateCart(req.user.id)
    const total = updated.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    return res.status(200).json({ success: true, message: 'Item removed', data: { cart: updated, total } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }
    return res.status(200).json({ success: true, message: 'Cart cleared' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}
