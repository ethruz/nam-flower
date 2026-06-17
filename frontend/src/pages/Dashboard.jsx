import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  PENDING:    { bg: '#FEF3C7', color: '#92400E' },
  CONFIRMED:  { bg: '#DBEAFE', color: '#1E40AF' },
  PROCESSING: { bg: '#EDE9FE', color: '#5B21B6' },
  SHIPPED:    { bg: '#D1FAE5', color: '#065F46' },
  DELIVERED:  { bg: '#D1FAE5', color: '#065F46' },
  CANCELLED:  { bg: '#FEE2E2', color: '#991B1B' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeOrder, setActiveOrder] = useState(null)

  useEffect(() => {
    document.title = 'My Orders — Nam Flower'
    api.get('/orders/my')
      .then(res => setOrders(res.data.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />

      <div style={{ background: '#F2EDD8', padding: '36px 24px', borderBottom: '1px solid #E8DFC8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '6px' }}>Welcome back</div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontWeight: '600', color: '#2C1A0E', margin: 0 }}>
            {user?.name}'s Orders
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8B6A4A' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', color: '#2C1A0E', marginBottom: '12px' }}>No orders yet</h2>
            <p style={{ color: '#8B6A4A', marginBottom: '28px' }}>You haven't placed any orders yet</p>
            <Link to="/products" style={{ background: '#E8C547', color: '#2C1A0E', padding: '13px 32px', borderRadius: '28px', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '14px', overflow: 'hidden' }}>

                {/* Order header */}
                <div
                  style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: activeOrder === order.id ? '#FEFBE8' : '#fff' }}
                  onClick={() => setActiveOrder(activeOrder === order.id ? null : order.id)}
                >
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#8B6A4A', marginBottom: '3px' }}>Order</div>
                      <div style={{ fontWeight: '600', color: '#2C1A0E' }}>#{order.id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#8B6A4A', marginBottom: '3px' }}>Date</div>
                      <div style={{ fontSize: '14px', color: '#2C1A0E' }}>{new Date(order.createdAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#8B6A4A', marginBottom: '3px' }}>Total</div>
                      <div style={{ fontWeight: '600', color: '#8B5E3C' }}>Rs. {order.totalAmount?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#8B6A4A', marginBottom: '3px' }}>Payment</div>
                      <div style={{ fontSize: '13px', color: '#2C1A0E' }}>{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'eSewa'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ background: STATUS_COLORS[order.status]?.bg, color: STATUS_COLORS[order.status]?.color, padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                      {order.status}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B6A4A" strokeWidth="2" strokeLinecap="round" style={{ transform: activeOrder === order.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Order items (expanded) */}
                {activeOrder === order.id && (
                  <div style={{ borderTop: '1px solid #EDE4C4', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                      {order.items?.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', background: '#F2EDD8', flexShrink: 0 }}>
                            <img src={item.product?.imageUrl || `https://picsum.photos/seed/${item.productId}/56/56`} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', color: '#2C1A0E', fontSize: '14px' }}>{item.product?.name}</div>
                            <div style={{ fontSize: '13px', color: '#8B6A4A' }}>x{item.quantity} × Rs. {item.price?.toLocaleString()}</div>
                          </div>
                          <div style={{ fontWeight: '500', color: '#2C1A0E', fontSize: '14px' }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #EDE4C4', paddingTop: '16px', fontSize: '14px', color: '#6B4C3B' }}>
                      <div>
                        <span style={{ fontWeight: '500' }}>Delivery: </span>
                        {order.deliveryAddress}
                      </div>
                      <div style={{ fontWeight: '600', color: '#8B5E3C' }}>Total: Rs. {order.totalAmount?.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
