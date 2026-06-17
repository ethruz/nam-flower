import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../utils/api'

export default function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    deliveryAddress: '',
    deliveryDate: '',
    paymentMethod: 'CASH_ON_DELIVERY'
  })

  useEffect(() => {
    document.title = 'Checkout — Nam Flower'
    api.get('/cart')
      .then(res => {
        const data = res.data.data
        if (!data.cart.items?.length) return navigate('/cart')
        setCart(data.cart)
        setTotal(data.total)
      })
      .catch(() => navigate('/cart'))
      .finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.deliveryAddress.trim()) return setError('Please enter delivery address')
    setSubmitting(true)
    try {
      const res = await api.post('/orders', {
        paymentMethod: form.paymentMethod,
        deliveryAddress: form.deliveryAddress,
        deliveryDate: form.deliveryDate || undefined
      })
      const order = res.data.data.order

      if (form.paymentMethod === 'ESEWA') {
        // Initiate eSewa payment
        const payRes = await api.post('/payments/esewa/initiate', { orderId: order.id })
        // Submit form to eSewa
        const { formData, esewaUrl } = payRes.data.data
        const form2 = document.createElement('form')
        form2.method = 'POST'
        form2.action = esewaUrl
        Object.entries(formData).forEach(([k, v]) => {
          const input = document.createElement('input')
          input.name = k; input.value = v; input.type = 'hidden'
          form2.appendChild(input)
        })
        document.body.appendChild(form2)
        form2.submit()
      } else {
        // Cash on delivery
        await api.post('/payments/cash', { orderId: order.id })
        navigate('/payment/success', { state: { order } })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#8B6A4A' }}>Loading...</div>
    </div>
  )

  const items = cart?.items || []
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />

      <div style={{ background: '#F2EDD8', padding: '36px 24px', borderBottom: '1px solid #E8DFC8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '6px' }}>Final step</div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontWeight: '600', color: '#2C1A0E', margin: 0 }}>Checkout</h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '40px', alignItems: 'start' }}>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Delivery info */}
            <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2C1A0E', marginBottom: '20px' }}>Delivery Details</h2>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Delivery Address *</label>
                <textarea
                  value={form.deliveryAddress}
                  onChange={set('deliveryAddress')}
                  placeholder="Enter your full address (street, area, city)"
                  rows={3}
                  required
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = '#C4956A'}
                  onBlur={e => e.target.style.borderColor = '#E8DFC8'}
                />
              </div>

              <div>
                <label style={labelStyle}>Preferred Delivery Date <span style={{ color: '#B09070', fontWeight: '400' }}>(optional)</span></label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={set('deliveryDate')}
                  min={minDate}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#C4956A'}
                  onBlur={e => e.target.style.borderColor = '#E8DFC8'}
                />
              </div>
            </div>

            {/* Payment method */}
            <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2C1A0E', marginBottom: '20px' }}>Payment Method</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', desc: 'Pay when your flowers arrive', icon: <CashIcon /> },
                  { value: 'ESEWA', label: 'eSewa', desc: 'Pay securely with eSewa', icon: <EsewaIcon /> },
                ].map(opt => (
                  <label
                    key={opt.value}
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', border: `2px solid ${form.paymentMethod === opt.value ? '#E8C547' : '#E8DFC8'}`, borderRadius: '12px', cursor: 'pointer', background: form.paymentMethod === opt.value ? '#FEFBE8' : '#fff', transition: 'all 0.2s' }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.value}
                      checked={form.paymentMethod === opt.value}
                      onChange={set('paymentMethod')}
                      style={{ display: 'none' }}
                    />
                    <div style={{ color: '#C4956A' }}>{opt.icon}</div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#2C1A0E', fontSize: '15px' }}>{opt.label}</div>
                      <div style={{ fontSize: '13px', color: '#8B6A4A' }}>{opt.desc}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${form.paymentMethod === opt.value ? '#E8C547' : '#D0C8B8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {form.paymentMethod === opt.value && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E8C547' }} />}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{ width: '100%', background: submitting ? '#D4B84A' : '#E8C547', color: '#2C1A0E', border: 'none', borderRadius: '28px', padding: '15px', fontSize: '16px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {submitting ? 'Placing order...' : form.paymentMethod === 'ESEWA' ? 'Pay with eSewa' : 'Place Order'}
            </button>
          </form>

          {/* Order summary */}
          <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '16px', padding: '28px', position: 'sticky', top: '80px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2C1A0E', marginBottom: '20px' }}>Your Order</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#F2EDD8' }}>
                    <img src={item.product?.imageUrl || `https://picsum.photos/seed/${item.productId}/52/52`} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#2C1A0E' }}>{item.product?.name}</div>
                    <div style={{ fontSize: '12px', color: '#8B6A4A' }}>x{item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#2C1A0E' }}>Rs. {(item.product?.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #EDE4C4', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6B4C3B', marginBottom: '8px' }}>
                <span>Delivery</span><span style={{ color: '#4A7C59' }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#2C1A0E', fontSize: '18px', marginTop: '12px' }}>
                <span>Total</span>
                <span style={{ color: '#8B5E3C' }}>Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '8px' }
const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #E8DFC8', borderRadius: '10px', fontSize: '14px', color: '#2C1A0E', background: '#FEFCF7', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }

function CashIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> }
function EsewaIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> }