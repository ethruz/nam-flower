import { Router } from 'express'
import {
  getProducts, getProductById, getCategories,
  adminGetProducts, createProduct, updateProduct, deleteProduct,
  createCategory, updateCategory, deleteCategory,
  createReview, deleteReview
} from '../controllers/product.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()

// Public
router.get('/products', getProducts)
router.get('/products/:id', getProductById)
router.get('/categories', getCategories)

// Admin
router.get('/admin/products', protect, adminOnly, adminGetProducts)
router.post('/admin/products', protect, adminOnly, createProduct)
router.patch('/admin/products/:id', protect, adminOnly, updateProduct)
router.delete('/admin/products/:id', protect, adminOnly, deleteProduct)

router.get('/admin/categories', protect, adminOnly, getCategories)
router.post('/admin/categories', protect, adminOnly, createCategory)
router.patch('/admin/categories/:id', protect, adminOnly, updateCategory)
router.delete('/admin/categories/:id', protect, adminOnly, deleteCategory)

// Reviews
router.post('/products/:id/reviews', protect, createReview)
router.delete('/products/:id/reviews/:reviewId', protect, deleteReview)

export default router
