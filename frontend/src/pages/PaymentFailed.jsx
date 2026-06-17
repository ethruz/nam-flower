
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function PaymentFailed() {
  const navigate = useNavigate()
  useEffect(() => { document.title = 'Payment Failed — Nam Flower' }, [])

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
          {/* X icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ width: '72px', height: '72px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </motion.div>

          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '30px', fontWeight: '600', color: '#2C1A0E', marginBottom: '12px' }}>
            Payment Failed
          </h1>
          <p style={{ fontSize: '15px', color: '#6B4C3B', lineHeight: '1.7', marginBottom: '32px' }}>
            Something went wrong with your payment. Your cart has been saved — please try again.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{ background: '#E8C547', color: '#2C1A0E', border: 'none', padding: '13px 28px', borderRadius: '28px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Try Again
            </button>
            <Link to="/cart" style={{ color: '#8B6A4A', textDecoration: 'none', fontSize: '14px' }}>
              Back to Cart
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
