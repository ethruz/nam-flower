import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'

const HERO_IMAGE = 'https://picsum.photos/seed/flowers1/600/800'
const BOUQUET_IMAGE = 'http://localhost:5173/images/white.jpg'
const WEDDING_IMAGE = 'http://localhost:5173/images/wedding-boquet.jpg'


// Animated counter hook
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return { count, ref }
}

function StatCounter({ target, suffix, label }) {
  const { count, ref } = useCountUp(target)
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', fontWeight: '600', color: '#2C1A0E' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: '12px', color: '#8B6A4A', letterSpacing: '0.06em', marginTop: '2px' }}>{label}</div>
    </div>
  )
}

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }

export default function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    document.title = 'Nam Flower — Fresh Flowers Delivered in Nepal'
    api.get('/products?limit=4').then(res => setFeatured(res.data.data.products)).catch(() => {})
  }, [])

  return (
    <div style={{ background: '#FAFAF5', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ background: '#F2EDD8', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', minHeight: '540px' }}>

          {/* Left */}
          <motion.div initial="hidden" animate="show" variants={fadeUp} style={{ paddingRight: '40px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '16px', fontWeight: '500' }}>
              Fresh · Handcrafted · Delivered
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '52px', fontWeight: '600', color: '#2C1A0E', lineHeight: '1.15', marginBottom: '20px' }}>
              Blooming Flower<br />
              <em style={{ fontStyle: 'italic', color: '#8B5E3C' }}>Bright &amp; Beautiful</em>
            </h1>
            <p style={{ fontSize: '16px', color: '#6B4C3B', lineHeight: '1.7', marginBottom: '32px', maxWidth: '380px' }}>
              We prepare the best collection and choices — bringing nature's beauty and joy into your life, one bouquet at a time.
            </p>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <Link to="/products" style={{ background: '#E8C547', color: '#2C1A0E', padding: '13px 32px', borderRadius: '28px', textDecoration: 'none', fontSize: '15px', fontWeight: '500', letterSpacing: '0.01em' }}>
                Order Now
              </Link>
              <Link to="/products" style={{ color: '#8B5E3C', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Browse all
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </motion.div>

          {/* Right — flower image */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '40px', paddingBottom: '24px' }}>
            <div style={{ position: 'relative', width: '340px', height: '400px', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', borderRadius: '50%', background: '#E8D48A', opacity: 0.5, zIndex: 0 }} />
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '280px', height: '380px', borderRadius: '50% 50% 44% 44% / 40% 40% 60% 60%', overflow: 'hidden', zIndex: 1 }}>
                <img
                  src={HERO_IMAGE}
                  alt="Fresh flower bouquet"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar — animated counters */}
        <div style={{ background: '#EDE4C4', borderTop: '1px solid #DDD0A0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px', display: 'flex', gap: '48px', justifyContent: 'center' }}>
            <StatCounter target={500} suffix="+" label="Clients" />
            <StatCounter target={3500} suffix="+" label="Visits" />
            <StatCounter target={600} suffix="+" label="Orders" />
          </div>
        </div>
      </section>

      {/* ── Find Your Perfect Bouquet ────────────────────── */}
      <section style={{ background: '#F5F0E4', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

          {/* Image */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <img
              src={BOUQUET_IMAGE}
              alt="Find your perfect bouquet"
              style={{ width: '100%', height: '480px', objectFit: 'cover', borderRadius: '12px' }}
            />
          </motion.div>

          {/* Text */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15, ease: 'easeOut' } } }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '12px' }}>For every occasion</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '40px', fontWeight: '600', color: '#2C1A0E', lineHeight: '1.2', marginBottom: '20px' }}>
              Find Your Perfect<br />Bouquet Flower
            </h2>
            <p style={{ fontSize: '15px', color: '#6B4C3B', lineHeight: '1.75', marginBottom: '16px' }}>
              Every occasion deserves a touch of nature's beauty. Our flower-gifted art captures the language of your love story, using the freshest blooms to complete your perfect day.
            </p>
            <p style={{ fontSize: '15px', color: '#6B4C3B', lineHeight: '1.75', marginBottom: '32px' }}>
              We prepare the best collection and choices — from intimate everyday arrangements to grand wedding centrepieces.
            </p>
            <Link to="/products" style={{ background: '#E8C547', color: '#2C1A0E', padding: '13px 32px', borderRadius: '28px', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>
              Order Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Our Best Selling ─────────────────────────────── */}
      <section style={{ background: '#FAFAF5', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '10px' }}>Popular picks</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '36px', fontWeight: '600', color: '#2C1A0E' }}>Our Best Selling</h2>
          </motion.div>

          {featured.length === 0 ? (
            /* Placeholder cards if no products yet */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { name: 'Sunflower Bouquet', price: 850, img: 'https://images.unsplash.com/photo-1470509037663-253d62d2e98d?w=400&q=80' },
                { name: 'Rose Collection', price: 1200, img: 'https://images.unsplash.com/photo-1548094990-c16ca90f1f0d?w=400&q=80' },
                { name: 'Yellow Tulips', price: 650, img: 'https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=400&q=80' },
                { name: 'Mixed Bouquet', price: 950, img: 'https://images.unsplash.com/photo-1487530811015-780dca3778ce?w=400&q=80' },
              ].map((p, i) => (
                <ProductCard key={i} product={p} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/products" style={{ border: '1px solid #C4956A', color: '#8B5E3C', padding: '12px 36px', borderRadius: '28px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              View all flowers
            </Link>
          </div>
        </div>
      </section>

      {/* ── Wedding Bouquet Banner ────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '420px' }}>
        <img src={WEDDING_IMAGE} alt="Wedding bouquet" style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(30, 10, 0, 0.52)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 80px' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} style={{ maxWidth: '520px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#E8C547', marginBottom: '12px' }}>For your big day</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '44px', fontWeight: '600', color: '#FDF6E3', lineHeight: '1.2', marginBottom: '16px' }}>
              Wedding Bouquet
            </h2>
            <p style={{ fontSize: '15px', color: '#E0D0B8', lineHeight: '1.75', marginBottom: '28px' }}>
              Walk down the aisle with a masterpiece in your hands. Our bridal bouquets are intentionally crafted to capture the romance of your love story, using the freshest, most stunning blooms to complete your perfect day.
            </p>
            <Link to="/products?category=Wedding" style={{ background: '#E8C547', color: '#2C1A0E', padding: '13px 32px', borderRadius: '28px', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>
              Buy Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Bar ────────────────────────────────────── */}
      <section style={{ background: '#F2EDD8', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {[
            { icon: <PayIcon />, title: 'Easy Payment', desc: 'eSewa, Khalti & cash on delivery' },
            { icon: <DeliveryIcon />, title: 'Fast Delivery', desc: 'Same-day delivery in Kathmandu' },
            { icon: <UsersIcon />, title: 'Multiple Users', desc: 'Trusted by hundreds of customers' },
            { icon: <ShieldIcon />, title: 'Trusted', desc: 'Quality flowers, guaranteed fresh' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ marginBottom: '12px', color: '#8B5E3C' }}>{icon}</div>
              <div style={{ fontWeight: '500', color: '#2C1A0E', fontSize: '14px', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '13px', color: '#8B6A4A', lineHeight: '1.5' }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
      <Link to={`/products/${product.id || '#'}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ background: '#FDF8F0', borderRadius: '10px', overflow: 'hidden', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <img
            src={product.imageUrl || product.img || 'https://images.unsplash.com/photo-1487530811015-780dca3778ce?w=400&q=80'}
            alt={product.name}
            style={{ width: '100%', height: '220px', objectFit: 'cover' }}
          />
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#2C1A0E', marginBottom: '6px' }}>{product.name}</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#8B5E3C', marginBottom: '12px' }}>
              Rs. {product.price?.toLocaleString()}
            </div>
            <div style={{ background: '#E8C547', color: '#2C1A0E', padding: '8px 0', borderRadius: '20px', textAlign: 'center', fontSize: '13px', fontWeight: '500' }}>
              Add to Cart
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// SVG icons
function PayIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
}
function DeliveryIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
}
function UsersIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
}
function ShieldIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
