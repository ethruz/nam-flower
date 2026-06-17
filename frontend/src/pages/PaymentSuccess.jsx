
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function PaymentSuccess() {
  const { state } = useLocation()
  const order = state?.order

  useEffect(() => { document.title = 'Order Confirmed — Nam Flower' }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '20px', padding: '52px 48px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 32px rgba(44,26,14,0.08)' }}
        >
          {/* Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ width: '72px', height: '72px', background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </motion.div>

          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '30px', fontWeight: '600', color: '#2C1A0E', marginBottom: '12px' }}>
            Order Confirmed!
          </h1>
          <p style={{ fontSize: '15px', color: '#6B4C3B', lineHeight: '1.7', marginBottom: '28px' }}>
            Thank you for your order. Your fresh flowers are being prepared and will be delivered soon.
          </p>

          {order && (
            <div style={{ background: '#F2EDD8', borderRadius: '12px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: '#8B6A4A' }}>Order ID</span>
                <span style={{ fontWeight: '500', color: '#2C1A0E' }}>#{order.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: '#8B6A4A' }}>Total</span>
                <span style={{ fontWeight: '600', color: '#8B5E3C' }}>Rs. {order.totalAmount?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#8B6A4A' }}>Payment</span>
                <span style={{ fontWeight: '500', color: '#2C1A0E' }}>{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'eSewa'}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/dashboard" style={{ background: '#E8C547', color: '#2C1A0E', padding: '13px 28px', borderRadius: '28px', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>
              View My Orders
            </Link>
            <Link to="/products" style={{ color: '#8B6A4A', textDecoration: 'none', fontSize: '14px' }}>
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
