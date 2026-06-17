import { Router } from 'express'
import { createOrder, getMyOrders, getOrderById, adminGetOrders, adminUpdateOrderStatus } from '../controllers/order.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/', protect, createOrder)
router.get('/my', protect, getMyOrders)
router.get('/:id', protect, getOrderById)

// Admin
router.get('/admin/all', protect, adminOnly, adminGetOrders)
router.patch('/admin/:id/status', protect, adminOnly, adminUpdateOrderStatus)

export default router
