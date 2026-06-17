import { Router } from 'express'
import { signup, login, getMe, updateProfile } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', protect, getMe)
router.patch('/profile', protect, updateProfile)

export default router
