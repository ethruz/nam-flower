import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  // Close profile dropdown when clicking/tapping outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    // pointerdown covers mouse + touch more consistently than mousedown alone
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [])

  // Close both dropdowns on Escape for keyboard users
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setProfileOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // If the viewport grows past the mobile breakpoint while the mobile
  // menu is open, close it — otherwise the hamburger disappears but the
  // dropdown panel keeps rendering underneath the desktop nav with no
  // way to dismiss it.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    setMenuOpen(false)
    navigate('/')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <>
      <nav style={{ background: '#F5F0E8', borderBottom: '1px solid #E8DFC8', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

          {/* Logo */}
          <Link to="/" onClick={() => { setMenuOpen(false); setProfileOpen(false) }} style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: '600', color: '#3D2B1F', textDecoration: 'none', flexShrink: 0 }}>
            Nam Flower
          </Link>

          {/* Desktop nav links */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            <Link to="/" style={navLink}>Home</Link>
            <Link to="/products" style={navLink}>Shop</Link>
            <Link to="/products?category=Bouquets" style={navLink}>Bouquets</Link>
            <Link to="/products?category=Wedding" style={navLink}>Wedding</Link>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* Cart */}
            <Link
              to="/cart"
              onClick={() => { setMenuOpen(false); setProfileOpen(false) }}
              style={{ color: '#3D2B1F', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span style={{ fontSize: '13px', color: '#6B4C3B' }} className="desktop-nav">Cart</span>
            </Link>

            {/* Profile dropdown (logged in) OR Login/Signup buttons */}
            {user ? (
              <div ref={profileRef} style={{ position: 'relative' }} className="desktop-nav">
                {/* Avatar button */}
                <button
                  onClick={() => { setProfileOpen(o => !o); setMenuOpen(false) }}
                  aria-label="User menu"
                  aria-expanded={profileOpen}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E8C547', border: '2px solid #D4B030', color: '#2C1A0E', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', transition: 'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {initials}
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '260px', background: '#fff', border: '1px solid #EDE4C4', borderRadius: '14px', boxShadow: '0 8px 32px rgba(44,26,14,0.12)', overflow: 'hidden', zIndex: 200 }}>

                    {/* User info header */}
                    <div style={{ padding: '18px 20px', background: '#F2EDD8', borderBottom: '1px solid #EDE4C4' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E8C547', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#2C1A0E', flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: '600', color: '#2C1A0E', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                          <div style={{ fontSize: '12px', color: '#8B6A4A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                          {user.role === 'ADMIN' && (
                            <span style={{ fontSize: '10px', background: '#2C1A0E', color: '#E8C547', padding: '1px 8px', borderRadius: '8px', fontWeight: '600', letterSpacing: '0.06em' }}>ADMIN</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: '8px 0' }}>
                      {user.role === 'ADMIN' && (
                        <>
                          <DropdownLink to="/admin" icon={<AdminIcon />} label="Admin Panel" sub="Manage store" onClick={() => setProfileOpen(false)} highlight />
                          <div style={{ height: '1px', background: '#EDE4C4', margin: '6px 0' }} />
                        </>
                      )}
                      <DropdownLink to="/profile" icon={<ProfileIcon />} label="My Profile" sub="Edit name, phone, password" onClick={() => setProfileOpen(false)} />
                      <DropdownLink to="/dashboard" icon={<OrderIcon />} label="My Orders" sub="Track your orders" onClick={() => setProfileOpen(false)} />
                      <DropdownLink to="/cart" icon={<CartIcon />} label="My Cart" sub="View saved items" onClick={() => setProfileOpen(false)} />

                      <div style={{ height: '1px', background: '#EDE4C4', margin: '6px 0' }} />

                      {/* Settings */}
                      <DropdownLink to="/profile" icon={<SettingsIcon />} label="Settings" sub="Account preferences" onClick={() => setProfileOpen(false)} />

                      <div style={{ height: '1px', background: '#EDE4C4', margin: '6px 0' }} />

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <span style={{ color: '#DC2626', display: 'flex' }}><LogoutIcon /></span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#DC2626' }}>Logout</div>
                          <div style={{ fontSize: '12px', color: '#B09070' }}>Sign out of your account</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="desktop-nav" style={{ gap: '10px', alignItems: 'center' }}>
                <Link
                  to="/login"
                  style={{ ...navLink, display: 'flex', alignItems: 'center', padding: '7px 0', lineHeight: 1 }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{ background: '#E8C547', color: '#3D2B1F', padding: '7px 18px', borderRadius: '20px', textDecoration: 'none', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', lineHeight: 1 }}
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="mobile-menu-btn"
              onClick={() => { setMenuOpen(!menuOpen); setProfileOpen(false) }}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#3D2B1F' }}
            >
              {menuOpen
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{ background: '#F5F0E8', borderTop: '1px solid #E8DFC8', padding: '16px 20px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[['/', 'Home'], ['/products', 'Shop'], ['/products?category=Bouquets', 'Bouquets'], ['/products?category=Wedding', 'Wedding']].map(([to, label]) => (
                <Link key={label} to={to} onClick={() => setMenuOpen(false)} style={{ padding: '11px 0', color: '#5C3D2E', textDecoration: 'none', fontSize: '15px', borderBottom: '1px solid #EDE4C4' }}>
                  {label}
                </Link>
              ))}

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {user ? (
                  <>
                    {/* Mobile user info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #EDE4C4' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E8C547', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#2C1A0E' }}>{initials}</div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#2C1A0E', fontSize: '14px' }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#8B6A4A' }}>{user.email}</div>
                      </div>
                    </div>
                    {user.role === 'ADMIN' && <Link to="/admin" onClick={() => setMenuOpen(false)} style={mobileLink}>Admin Panel</Link>}
                    <Link to="/profile" onClick={() => setMenuOpen(false)} style={mobileLink}>My Profile</Link>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={mobileLink}>My Orders</Link>
                    <Link to="/cart" onClick={() => setMenuOpen(false)} style={mobileLink}>My Cart</Link>
                    <button onClick={handleLogout} style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', fontWeight: '500', marginTop: '4px' }}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} style={{ ...mobileLink, textAlign: 'center', border: '1px solid #C4956A', padding: '10px', borderRadius: '20px' }}>Login</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} style={{ background: '#E8C547', color: '#3D2B1F', padding: '10px', borderRadius: '20px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .desktop-nav { display: flex; }
        .mobile-menu-btn { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}

function DropdownLink({ to, icon, label, sub, onClick, highlight }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={to}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', textDecoration: 'none', background: hovered ? '#F2EDD8' : 'none', transition: 'background 0.15s' }}
    >
      <span style={{ color: highlight ? '#8B5E3C' : '#C4956A', display: 'flex', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#2C1A0E' }}>{label}</div>
        <div style={{ fontSize: '12px', color: '#8B6A4A' }}>{sub}</div>
      </div>
    </Link>
  )
}

// Icons
const navLink = { color: '#5C3D2E', textDecoration: 'none', fontSize: '14px', fontWeight: '400' }
const mobileLink = { color: '#5C3D2E', textDecoration: 'none', fontSize: '14px' }

function ProfileIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function OrderIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> }
function CartIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> }
function SettingsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> }
function AdminIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function LogoutIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }