import { Router } from 'express'
import { getDashboard, getCustomers, getReports } from '../controllers/admin.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect, adminOnly)

router.get('/dashboard', getDashboard)
router.get('/customers', getCustomers)
router.get('/reports', getReports)

export default router
