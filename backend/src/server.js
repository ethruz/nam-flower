import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'
import adminRoutes from './routes/admin.routes.js'
import paymentRoutes from './routes/payment.routes.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
app.use(express.json())

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use('/api', limiter)

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 })
app.use('/api/auth', authLimiter)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Nam Flower API is running' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payments', paymentRoutes)

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Nam Flower server running on port ${PORT}`)
})
