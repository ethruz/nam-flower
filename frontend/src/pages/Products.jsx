import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const activeCategory = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    document.title = 'Shop — Nam Flower'
    api.get('/categories').then(res => setCategories(res.data.data.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeCategory) params.set('category', activeCategory)
    if (search) params.set('search', search)
    params.set('page', page)
    params.set('limit', '12')

    api.get(`/products?${params}`)
      .then(res => {
        setProducts(res.data.data.products)
        setPagination(res.data.data.pagination)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeCategory, page, search])

  const setCategory = (cat) => {
    const p = new URLSearchParams()
    if (cat) p.set('category', cat)
    if (search) p.set('search', search)
    setSearchParams(p)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (activeCategory) p.set('category', activeCategory)
    if (search) p.set('search', search)
    setSearchParams(p)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#F2EDD8', padding: '48px 24px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '10px' }}>Our collection</div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '38px', fontWeight: '600', color: '#2C1A0E', margin: '0 0 20px' }}>
          Fresh Flowers
        </h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ maxWidth: '440px', margin: '0 auto', display: 'flex', gap: '0', background: '#fff', borderRadius: '28px', border: '1px solid #E8DFC8', overflow: 'hidden' }}>
          <input
            type="text"
            placeholder="Search flowers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '12px 20px', border: 'none', outline: 'none', fontSize: '14px', background: 'transparent', fontFamily: 'inherit', color: '#2C1A0E' }}
          />
          <button type="submit" style={{ background: '#E8C547', border: 'none', padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2C1A0E" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
        </form>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ display: 'flex', gap: '36px' }}>

          {/* Sidebar filters */}
          <div style={{ width: '200px', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '16px', fontWeight: '500' }}>Categories</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setCategory('')}
                style={{ textAlign: 'left', background: activeCategory === '' ? '#F2EDD8' : 'none', border: 'none', padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: activeCategory === '' ? '#2C1A0E' : '#6B4C3B', fontWeight: activeCategory === '' ? '500' : '400', fontFamily: 'inherit' }}
              >
                All flowers
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.name)}
                  style={{ textAlign: 'left', background: activeCategory === cat.name ? '#F2EDD8' : 'none', border: 'none', padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: activeCategory === cat.name ? '#2C1A0E' : '#6B4C3B', fontWeight: activeCategory === cat.name ? '500' : '400', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  {cat.name}
                  <span style={{ fontSize: '12px', color: '#B09070' }}>{cat._count?.products || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products grid */}
          <div style={{ flex: 1 }}>
            {/* Result count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#8B6A4A' }}>
                {loading ? 'Loading...' : `${pagination.total || 0} flowers found`}
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ background: '#F2EDD8', borderRadius: '10px', height: '300px', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto', display: 'block' }}><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M8 15s1.5-2 4-2 4 2 4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                </div>
                <div style={{ fontSize: '18px', color: '#2C1A0E', fontWeight: '500', marginBottom: '8px' }}>No flowers found</div>
                <div style={{ fontSize: '14px', color: '#8B6A4A' }}>Try a different search or category</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                {[...Array(pagination.pages)].map((_, i) => {
                  const p = i + 1
                  const params = new URLSearchParams(searchParams)
                  params.set('page', p)
                  return (
                    <Link
                      key={p}
                      to={`?${params}`}
                      style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', textDecoration: 'none', fontSize: '14px', background: p === page ? '#E8C547' : '#F2EDD8', color: p === page ? '#2C1A0E' : '#6B4C3B', fontWeight: p === page ? '600' : '400' }}
                    >
                      {p}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function ProductCard({ product, index }) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const addToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/login'
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #EDE4C4', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(44,26,14,0.10)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          {/* Image */}
          <div style={{ position: 'relative', height: '220px', background: '#F2EDD8', overflow: 'hidden' }}>
            <img
              src={product.imageUrl || `https://cdn.pixabay.com/photo/2017/02/15/11/37/tulips-2068692_1280.jpg`}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {product.stock <= 5 && product.stock > 0 && (
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#F59E0B', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '10px', fontWeight: '500' }}>
                Only {product.stock} left
              </div>
            )}
            {product.stock === 0 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#6B4226' }}>Out of stock</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ padding: '16px' }}>
            {product.category && (
              <div style={{ fontSize: '11px', color: '#C4956A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>{product.category.name}</div>
            )}
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#2C1A0E', marginBottom: '8px' }}>{product.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#8B5E3C' }}>Rs. {product.price?.toLocaleString()}</div>
              <button
                onClick={addToCart}
                disabled={adding || product.stock === 0}
                style={{ background: added ? '#4A7C59' : '#E8C547', color: added ? '#fff' : '#2C1A0E', border: 'none', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s', opacity: product.stock === 0 ? 0.5 : 1 }}
              >
                {adding ? '...' : added ? 'Added!' : '+ Cart'}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
