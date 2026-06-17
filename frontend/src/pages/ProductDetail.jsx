import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data.data.product)
        document.title = `${res.data.data.product.name} — Nam Flower`
      })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  const addToCart = async () => {
    if (!user) return navigate('/login')
    setAdding(true)
    try {
      await api.post('/cart', { productId: product.id, quantity })
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    setSubmittingReview(true)
    setReviewError('')
    try {
      await api.post(`/products/${id}/reviews`, reviewForm)
      const res = await api.get(`/products/${id}`)
      setProduct(res.data.data.product)
      setReviewForm({ rating: 5, comment: '' })
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ fontSize: '16px', color: '#8B6A4A' }}>Loading...</div>
      </div>
    </div>
  )

  if (error || !product) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '16px' }}>
        <div style={{ fontSize: '18px', color: '#2C1A0E' }}>Product not found</div>
        <Link to="/products" style={{ color: '#C4956A', textDecoration: 'none' }}>Back to Shop</Link>
      </div>
    </div>
  )

  const avgRating = product.avgRating ? product.avgRating.toFixed(1) : null

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div style={{ background: '#F2EDD8', padding: '14px 24px', borderBottom: '1px solid #E8DFC8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '13px', color: '#8B6A4A', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#8B6A4A', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: '#8B6A4A', textDecoration: 'none' }}>Shop</Link>
          <span>/</span>
          <span style={{ color: '#2C1A0E' }}>{product.name}</span>
        </div>
      </div>

      {/* Main product section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>

          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#F2EDD8', aspectRatio: '4/5' }}>
              <img
                src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/750`}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>

            {product.category && (
              <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '10px' }}>
                {product.category.name}
              </div>
            )}

            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '36px', fontWeight: '600', color: '#2C1A0E', margin: '0 0 12px' }}>
              {product.name}
            </h1>

            {/* Rating */}
            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <StarRow rating={parseFloat(avgRating)} />
                <span style={{ fontSize: '14px', color: '#8B6A4A' }}>{avgRating} ({product.reviews?.length} reviews)</span>
              </div>
            )}

            <div style={{ fontSize: '32px', fontWeight: '700', color: '#8B5E3C', marginBottom: '20px' }}>
              Rs. {product.price?.toLocaleString()}
            </div>

            {product.description && (
              <p style={{ fontSize: '15px', color: '#6B4C3B', lineHeight: '1.75', marginBottom: '28px' }}>
                {product.description}
              </p>
            )}

            {/* Stock */}
            <div style={{ marginBottom: '24px' }}>
              {product.stock === 0 ? (
                <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '500' }}>Out of stock</span>
              ) : product.stock <= 5 ? (
                <span style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '500' }}>Only {product.stock} left</span>
              ) : (
                <span style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '500' }}>In stock</span>
              )}
            </div>

            {/* Quantity + Add to cart */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                {/* Quantity picker */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E8DFC8', borderRadius: '24px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width: '40px', height: '44px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#2C1A0E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >−</button>
                  <span style={{ width: '36px', textAlign: 'center', fontSize: '15px', fontWeight: '500', color: '#2C1A0E' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    style={{ width: '40px', height: '44px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#2C1A0E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>

                <button
                  onClick={addToCart}
                  disabled={adding}
                  style={{ flex: 1, background: added ? '#4A7C59' : '#E8C547', color: added ? '#fff' : '#2C1A0E', border: 'none', borderRadius: '28px', padding: '14px 28px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
                >
                  {adding ? 'Adding...' : added ? 'Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
            )}

            {error && <div style={{ color: '#991B1B', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}

            {/* Go to cart */}
            {added && (
              <Link to="/cart" style={{ display: 'block', textAlign: 'center', color: '#8B5E3C', fontSize: '14px', textDecoration: 'underline', marginBottom: '16px' }}>
                View Cart
              </Link>
            )}

            {/* Trust badges */}
            <div style={{ borderTop: '1px solid #EDE4C4', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['Same-day delivery in Kathmandu', <TruckIcon />],
                ['Fresh flowers guaranteed', <ShieldIcon />],
                ['Easy returns within 24 hours', <RefundIcon />],
              ].map(([text, icon]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#6B4C3B' }}>
                  <span style={{ color: '#C4956A' }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews section */}
        <div style={{ marginTop: '64px', borderTop: '1px solid #EDE4C4', paddingTop: '48px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '28px', fontWeight: '600', color: '#2C1A0E', marginBottom: '32px' }}>
            Customer Reviews
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>

            {/* Review list */}
            <div>
              {!product.reviews || product.reviews.length === 0 ? (
                <div style={{ color: '#8B6A4A', fontSize: '15px', fontStyle: 'italic' }}>No reviews yet — be the first!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {product.reviews.map(review => (
                    <div key={review.id} style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#2C1A0E', fontSize: '14px' }}>{review.user?.name}</div>
                          <StarRow rating={review.rating} size={14} />
                        </div>
                        <div style={{ fontSize: '12px', color: '#B09070' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                      </div>
                      {review.comment && <p style={{ fontSize: '14px', color: '#6B4C3B', margin: 0, lineHeight: '1.6' }}>{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a review */}
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2C1A0E', marginBottom: '20px' }}>Write a Review</h3>
              {!user ? (
                <div style={{ background: '#F2EDD8', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                  <p style={{ color: '#6B4C3B', marginBottom: '16px' }}>Please log in to leave a review</p>
                  <Link to="/login" style={{ background: '#E8C547', color: '#2C1A0E', padding: '10px 24px', borderRadius: '20px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Login</Link>
                </div>
              ) : (
                <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Star rating */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '8px' }}>Your Rating</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24" fill={star <= reviewForm.rating ? '#E8C547' : 'none'} stroke="#E8C547" strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '8px' }}>Comment (optional)</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder="Share your experience..."
                      rows={4}
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid #E8DFC8', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', color: '#2C1A0E', background: '#FEFCF7', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  </div>

                  {reviewError && <div style={{ color: '#991B1B', fontSize: '13px' }}>{reviewError}</div>}

                  <button
                    type="submit"
                    disabled={submittingReview}
                    style={{ background: '#E8C547', color: '#2C1A0E', border: 'none', borderRadius: '24px', padding: '12px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function StarRow({ rating, size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#E8C547' : 'none'} stroke="#E8C547" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

function TruckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
}
function ShieldIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function RefundIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
}
