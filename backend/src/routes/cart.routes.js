import { Router } from 'express'
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router.get('/', getCart)
router.post('/', addToCart)
router.patch('/:itemId', updateCartItem)
router.delete('/:itemId', removeCartItem)
router.delete('/', clearCart)

export default router
