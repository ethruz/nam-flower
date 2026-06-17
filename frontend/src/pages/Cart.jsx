import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    document.title = 'Cart — Nam Flower'
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart')
      setCart(res.data.data.cart)
      setTotal(res.data.data.total)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const updateQty = async (itemId, quantity) => {
    if (quantity < 1) return removeItem(itemId)
    setUpdating(itemId)
    try {
      const res = await api.patch(`/cart/${itemId}`, { quantity })
      setCart(res.data.data.cart)
      setTotal(res.data.data.total)
    } catch {}
    finally { setUpdating(null) }
  }

  const removeItem = async (itemId) => {
    setUpdating(itemId)
    try {
      const res = await api.delete(`/cart/${itemId}`)
      setCart(res.data.data.cart)
      setTotal(res.data.data.total)
    } catch {}
    finally { setUpdating(null) }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart')
      setCart(prev => ({ ...prev, items: [] }))
      setTotal(0)
    } catch {}
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#8B6A4A' }}>Loading cart...</div>
    </div>
  )

  const items = cart?.items || []

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#F2EDD8', padding: '36px 24px', borderBottom: '1px solid #E8DFC8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '6px' }}>Your selection</div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontWeight: '600', color: '#2C1A0E', margin: 0 }}>
              Shopping Cart {items.length > 0 && <span style={{ fontSize: '20px', color: '#8B6A4A' }}>({items.length})</span>}
            </h1>
          </div>
          {items.length > 0 && (
            <button onClick={clearCart} style={{ background: 'none', border: '1px solid #E8DFC8', color: '#8B6A4A', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
              Clear cart
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {items.length === 0 ? (
          /* Empty cart */
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ marginBottom: '20px', color: '#C4956A' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', display: 'block' }}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', color: '#2C1A0E', marginBottom: '12px' }}>Your cart is empty</h2>
            <p style={{ color: '#8B6A4A', marginBottom: '28px', fontSize: '15px' }}>Looks like you haven't added any flowers yet</p>
            <Link to="/products" style={{ background: '#E8C547', color: '#2C1A0E', padding: '13px 32px', borderRadius: '28px', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>
              Browse flowers
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>

            {/* Cart items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.3 }}
                    style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', padding: '20px', display: 'flex', gap: '20px', alignItems: 'center', opacity: updating === item.id ? 0.6 : 1, transition: 'opacity 0.2s' }}
                  >
                    {/* Image */}
                    <div style={{ width: '90px', height: '90px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#F2EDD8' }}>
                      <img
                        src={item.product?.imageUrl || `https://picsum.photos/seed/${item.productId}/90/90`}
                        alt={item.product?.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#2C1A0E', fontSize: '15px', marginBottom: '4px' }}>{item.product?.name}</div>
                      <div style={{ color: '#8B5E3C', fontWeight: '600', fontSize: '16px' }}>Rs. {item.product?.price?.toLocaleString()}</div>
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E8DFC8', borderRadius: '24px', overflow: 'hidden' }}>
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={updating === item.id}
                        style={{ width: '36px', height: '40px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#2C1A0E' }}
                      >−</button>
                      <span style={{ width: '32px', textAlign: 'center', fontSize: '14px', fontWeight: '500', color: '#2C1A0E' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= item.product?.stock}
                        style={{ width: '36px', height: '40px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#2C1A0E' }}
                      >+</button>
                    </div>

                    {/* Item total */}
                    <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: '600', color: '#2C1A0E', fontSize: '15px' }}>
                      Rs. {(item.product?.price * item.quantity).toLocaleString()}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating === item.id}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B09070', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8B6A4A', fontSize: '14px', textDecoration: 'none', marginTop: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Continue shopping
              </Link>
            </div>

            {/* Order summary */}
            <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '16px', padding: '28px', position: 'sticky', top: '80px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#2C1A0E', marginBottom: '20px' }}>Order Summary</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6B4C3B' }}>
                  <span>Subtotal ({items.length} items)</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6B4C3B' }}>
                  <span>Delivery</span>
                  <span style={{ color: '#4A7C59', fontWeight: '500' }}>Free</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #EDE4C4', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontWeight: '600', color: '#2C1A0E', fontSize: '16px' }}>Total</span>
                <span style={{ fontWeight: '700', color: '#8B5E3C', fontSize: '20px' }}>Rs. {total.toLocaleString()}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                style={{ width: '100%', background: '#E8C547', color: '#2C1A0E', border: 'none', borderRadius: '28px', padding: '14px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '12px' }}
              >
                Proceed to Checkout
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#B09070' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Secure checkout
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
