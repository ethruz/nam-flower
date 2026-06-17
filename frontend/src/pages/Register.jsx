import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Register() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await signup(form.name, form.email, form.password, form.phone)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />

      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '10px' }}>
              Join us
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '34px', fontWeight: '600', color: '#2C1A0E', margin: 0 }}>
              Create account
            </h1>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 2px 24px rgba(44,26,14,0.08)', border: '1px solid #EDE4C4' }}>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Full name</label>
                <input type="text" placeholder="Your name" value={form.name} onChange={set('name')} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Email address</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Phone <span style={{ color: '#B09070', fontWeight: '400' }}>(optional)</span></label>
                <input type="tel" placeholder="98XXXXXXXX" value={form.phone} onChange={set('phone')} style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Password</label>
                <input type="password" placeholder="At least 6 characters" value={form.password} onChange={set('password')} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
              </div>
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Confirm password</label>
                <input type="password" placeholder="Repeat your password" value={form.confirm} onChange={set('confirm')} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: loading ? '#D4B84A' : '#E8C547', color: '#2C1A0E', border: 'none', borderRadius: '28px', padding: '14px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#EDE4C4' }} />
              <span style={{ fontSize: '12px', color: '#B09070' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#EDE4C4' }} />
            </div>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B4C3B', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#C4956A', fontWeight: '500', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '8px' }
const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #E8DFC8', borderRadius: '10px', fontSize: '14px', color: '#2C1A0E', background: '#FEFCF7', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }
