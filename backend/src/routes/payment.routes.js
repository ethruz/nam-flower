import { Router } from 'express'
import { initiateEsewa, esewaSuccess, cashOnDelivery, adminGetPayments } from '../controllers/payment.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/esewa/initiate', protect, initiateEsewa)
router.get('/esewa/success', esewaSuccess)          // eSewa redirects here (GET)
router.post('/cash', protect, cashOnDelivery)

router.get('/admin/all', protect, adminOnly, adminGetPayments)

export default router
