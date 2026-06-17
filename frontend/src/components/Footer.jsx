import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#2C1A0E', color: '#C8B89A', padding: '60px 24px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', color: '#F5E9C8', marginBottom: '12px' }}>Nam Flower</div>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#A08060', maxWidth: '260px' }}>
              Fresh flowers and handcrafted bouquets delivered to your door. We bring nature's beauty to your special moments.
            </p>
          </div>

          {/* Shop */}
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '16px', fontWeight: '500' }}>Shop</div>
            {['Bouquets', 'Wedding', 'Single Stems', 'Seasonal'].map(item => (
              <Link key={item} to={`/products?category=${item}`} style={{ display: 'block', color: '#A08060', textDecoration: 'none', fontSize: '14px', marginBottom: '10px' }}>{item}</Link>
            ))}
          </div>

          {/* Help */}
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '16px', fontWeight: '500' }}>Help</div>
            {['About Us', 'Delivery Info', 'Care Guide', 'Contact'].map(item => (
              <div key={item} style={{ color: '#A08060', fontSize: '14px', marginBottom: '10px' }}>{item}</div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '16px', fontWeight: '500' }}>Contact</div>
            <div style={{ color: '#A08060', fontSize: '14px', lineHeight: '1.8' }}>
              <div>Kathmandu, Nepal</div>
              <div>info@namflower.com</div>
              <div>+977 98XXXXXXXX</div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid #3D2510', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: '#6B4C3B' }}>© 2026 Nam Flower. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Instagram SVG */}
            <a href="#" style={{ color: '#6B4C3B' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            {/* Facebook SVG */}
            <a href="#" style={{ color: '#6B4C3B' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
