import prisma from '../config/db.js'
import { createProductSchema, updateProductSchema, createCategorySchema, updateCategorySchema } from '../validators/product.validator.js'

// ── Public: Products ──────────────────────────────────────────────

export const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, page = 1, limit = 12 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { isActive: true }

    if (category) {
      where.category = { name: { equals: category, mode: 'insensitive' } }
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ])

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
      }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: { select: { id: true, name: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const avgRating = product.reviews.length
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null

    return res.status(200).json({
      success: true,
      data: { product: { ...product, avgRating } }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Public: Categories ────────────────────────────────────────────

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    })
    return res.status(200).json({ success: true, data: { categories } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Admin: Products ───────────────────────────────────────────────

export const adminGetProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json({ success: true, data: { products } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const createProduct = async (req, res) => {
  try {
    const parsed = createProductSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message })
    }

    const product = await prisma.product.create({
      data: parsed.data,
      include: { category: { select: { id: true, name: true } } }
    })

    return res.status(201).json({ success: true, message: 'Product created', data: { product } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const parsed = updateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message })
    }

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: parsed.data,
      include: { category: { select: { id: true, name: true } } }
    })

    return res.status(200).json({ success: true, message: 'Product updated', data: { product } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false }
    })
    return res.status(200).json({ success: true, message: 'Product deleted' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Admin: Categories ─────────────────────────────────────────────

export const createCategory = async (req, res) => {
  try {
    const parsed = createCategorySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message })
    }

    const category = await prisma.category.create({ data: parsed.data })
    return res.status(201).json({ success: true, message: 'Category created', data: { category } })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Category name already exists' })
    }
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const updateCategory = async (req, res) => {
  try {
    const parsed = updateCategorySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message })
    }

    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: parsed.data
    })
    return res.status(200).json({ success: true, message: 'Category updated', data: { category } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const deleteCategory = async (req, res) => {
  try {
    await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false }
    })
    return res.status(200).json({ success: true, message: 'Category deleted' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ── Reviews ───────────────────────────────────────────────────────

export const createReview = async (req, res) => {
  try {
    const productId = parseInt(req.params.id)
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' })
    }

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    // Check user has ordered this product (verified buyer)
    const hasBought = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: req.user.id, status: { in: ['DELIVERED', 'CONFIRMED', 'SHIPPED'] } }
      }
    })

    // Check not already reviewed
    const existing = await prisma.review.findFirst({
      where: { productId, userId: req.user.id }
    })
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' })
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.id,
        rating: parseInt(rating),
        comment: comment || null
      },
      include: { user: { select: { id: true, name: true } } }
    })

    return res.status(201).json({
      success: true,
      message: 'Review submitted',
      data: { review, verifiedBuyer: !!hasBought }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const deleteReview = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: parseInt(req.params.reviewId) } })

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    // Only review owner or admin can delete
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    await prisma.review.delete({ where: { id: review.id } })
    return res.status(200).json({ success: true, message: 'Review deleted' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}
