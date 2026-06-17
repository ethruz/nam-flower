import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'ADMIN' ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />

      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '10px' }}>
              Welcome back
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '34px', fontWeight: '600', color: '#2C1A0E', margin: 0 }}>
              Sign in
            </h1>
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 2px 24px rgba(44,26,14,0.08)', border: '1px solid #EDE4C4' }}>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#C4956A'}
                  onBlur={e => e.target.style.borderColor = '#E8DFC8'}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#C4956A'}
                  onBlur={e => e.target.style.borderColor = '#E8DFC8'}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: loading ? '#D4B84A' : '#E8C547', color: '#2C1A0E', border: 'none', borderRadius: '28px', padding: '14px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#EDE4C4' }} />
              <span style={{ fontSize: '12px', color: '#B09070' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#EDE4C4' }} />
            </div>

            {/* Register link */}
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B4C3B', margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#C4956A', fontWeight: '500', textDecoration: 'none' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '500',
  color: '#5C3D2E',
  marginBottom: '8px',
  letterSpacing: '0.01em',
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #E8DFC8',
  borderRadius: '10px',
  fontSize: '14px',
  color: '#2C1A0E',
  background: '#FEFCF7',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}
