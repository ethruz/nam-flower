import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', currentPassword: '', newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ orders: 0, spent: 0 })

  useEffect(() => {
    document.title = 'My Profile — Nam Flower'
    if (user) setForm(f => ({ ...f, name: user.name || '', phone: user.phone || '' }))
    api.get('/orders/my').then(res => {
      const orders = res.data.data.orders
      setStats({ orders: orders.length, spent: orders.reduce((s, o) => s + o.totalAmount, 0) })
    }).catch(() => {})
  }, [user])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (form.newPassword && form.newPassword !== form.confirm) return setError('New passwords do not match')
    if (form.newPassword && form.newPassword.length < 6) return setError('New password must be at least 6 characters')
    setLoading(true)
    try {
      const payload = { name: form.name, phone: form.phone }
      if (form.newPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword }
      const res = await api.patch('/auth/profile', payload)
      updateUser(res.data.data.user)
      setSuccess('Profile updated successfully!')
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirm: '' }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />

      <div style={{ background: '#F2EDD8', padding: '36px 24px', borderBottom: '1px solid #E8DFC8' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '6px' }}>Account</div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontWeight: '600', color: '#2C1A0E', margin: 0 }}>My Profile</h1>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Orders', value: stats.orders },
            { label: 'Total Spent', value: `Rs. ${stats.spent.toLocaleString()}` },
            { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString('en-NP', { month: 'short', year: 'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: '600', color: '#8B5E3C', marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '13px', color: '#8B6A4A' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#2C1A0E', marginBottom: '24px' }}>Edit Details</h2>

          {success && <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>{success}</div>}
          {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={form.name} onChange={set('name')} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="98XXXXXXXX" style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Email <span style={{ color: '#B09070', fontWeight: '400' }}>(cannot be changed)</span></label>
              <input type="email" value={user?.email || ''} disabled style={{ ...inputStyle, background: '#F5F0E8', color: '#8B6A4A', cursor: 'not-allowed' }} />
            </div>

            <div style={{ borderTop: '1px solid #EDE4C4', paddingTop: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#2C1A0E', marginBottom: '16px' }}>Change Password <span style={{ color: '#B09070', fontWeight: '400', fontSize: '13px' }}>(optional)</span></h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input type="password" value={form.currentPassword} onChange={set('currentPassword')} placeholder="Enter current password" style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <input type="password" value={form.newPassword} onChange={set('newPassword')} placeholder="Min 6 characters" style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat new password" style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? '#D4B84A' : '#E8C547', color: '#2C1A0E', border: 'none', borderRadius: '28px', padding: '13px 32px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '8px' }
const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #E8DFC8', borderRadius: '10px', fontSize: '14px', color: '#2C1A0E', background: '#FEFCF7', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }
