import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../utils/api'

const TABS = ['Overview', 'Products', 'Categories', 'Orders', 'Customers', 'Reports']

const STATUS_COLORS = {
  PENDING:    { bg: '#FEF3C7', color: '#92400E' },
  CONFIRMED:  { bg: '#DBEAFE', color: '#1E40AF' },
  PROCESSING: { bg: '#EDE9FE', color: '#5B21B6' },
  SHIPPED:    { bg: '#D1FAE5', color: '#065F46' },
  DELIVERED:  { bg: '#D1FAE5', color: '#065F46' },
  CANCELLED:  { bg: '#FEE2E2', color: '#991B1B' },
}

const STATUS_LIST = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [customerSearch, setCustomerSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [reports, setReports] = useState(null)
  const [reportYear, setReportYear] = useState(new Date().getFullYear())

  // Product form
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '', isActive: true })
  const [editingProduct, setEditingProduct] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [productError, setProductError] = useState('')

  // Category form
  const [catForm, setCatForm] = useState({ name: '', description: '' })
  const [showCatForm, setShowCatForm] = useState(false)
  const [catError, setCatError] = useState('')

  useEffect(() => {
    document.title = 'Admin — Nam Flower'
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, catsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/categories')
      ])
      setStats(statsRes.data.data)
      setCategories(catsRes.data.data.categories)
    } catch { navigate('/') }
    finally { setLoading(false) }
  }

  const loadProducts = async () => {
    const res = await api.get('/admin/products')
    setProducts(res.data.data.products)
  }

  const loadOrders = async () => {
    const res = await api.get('/orders/admin/all')
    const all = res.data.data.orders
    setOrders(all)
    setFilteredOrders(all)
  }

  const loadCustomers = async () => {
    const res = await api.get('/admin/customers')
    setCustomers(res.data.data.customers)
  }

  useEffect(() => {
    if (tab === 'Products') loadProducts()
    if (tab === 'Orders') loadOrders()
    if (tab === 'Customers') loadCustomers()
    if (tab === 'Reports') loadReports()
  }, [tab])

  const loadReports = async () => {
    const res = await api.get(`/admin/reports?year=${reportYear}`)
    setReports(res.data.data)
  }

  useEffect(() => {
    if (tab === 'Reports') loadReports()
  }, [reportYear])

  // Filter orders by search + status
  useEffect(() => {
    let result = orders
    if (orderSearch.trim()) {
      const q = orderSearch.trim().toLowerCase()
      result = result.filter(o =>
        String(o.id).includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q) ||
        o.deliveryAddress?.toLowerCase().includes(q)
      )
    }
    if (orderStatusFilter) {
      result = result.filter(o => o.status === orderStatusFilter)
    }
    setFilteredOrders(result)
  }, [orderSearch, orderStatusFilter, orders])

  // Product CRUD
  const saveProduct = async () => {
    setProductError('')
    if (!productForm.name || !productForm.price) return setProductError('Name and price are required')
    try {
      const data = { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) || 0, categoryId: productForm.categoryId ? parseInt(productForm.categoryId) : undefined }
      if (editingProduct) {
        await api.patch(`/admin/products/${editingProduct}`, data)
      } else {
        await api.post('/admin/products', data)
      }
      setShowProductForm(false)
      setEditingProduct(null)
      setProductForm({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '', isActive: true })
      loadProducts()
    } catch (err) {
      setProductError(err.response?.data?.message || 'Failed to save product')
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/admin/products/${id}`)
    loadProducts()
  }

  const editProduct = (p) => {
    setProductForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, imageUrl: p.imageUrl || '', categoryId: p.categoryId || '', isActive: p.isActive })
    setEditingProduct(p.id)
    setShowProductForm(true)
  }

  // Category CRUD
  const saveCategory = async () => {
    setCatError('')
    if (!catForm.name) return setCatError('Name is required')
    try {
      await api.post('/admin/categories', catForm)
      setShowCatForm(false)
      setCatForm({ name: '', description: '' })
      const res = await api.get('/categories')
      setCategories(res.data.data.categories)
    } catch (err) {
      setCatError(err.response?.data?.message || 'Failed to save category')
    }
  }

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return
    await api.delete(`/admin/categories/${id}`)
    const res = await api.get('/categories')
    setCategories(res.data.data.categories)
  }

  const updateOrderStatus = async (orderId, status) => {
    await api.patch(`/orders/admin/${orderId}/status`, { status })
    loadOrders()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status }))
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#8B6A4A' }}>Loading admin panel...</div>
    </div>
  )

  const pf = (f) => (e) => setProductForm(prev => ({ ...prev, [f]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#2C1A0E', padding: '20px 16px' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4956A', marginBottom: '4px' }}>Admin Panel</div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: '600', color: '#F5E9C8', margin: 0 }}>Nam Flower Dashboard</h1>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDE4C4', overflowX: 'auto' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 16px', display: 'flex', gap: '0', minWidth: 'max-content' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? '#E8C547' : 'transparent'}`, padding: '14px 18px', fontSize: '14px', fontWeight: tab === t ? '600' : '400', color: tab === t ? '#2C1A0E' : '#8B6A4A', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '24px 16px' }}>

        {/* ── Overview ── */}
        {tab === 'Overview' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Products', value: stats.stats.totalProducts, color: '#8B5E3C' },
                { label: 'Orders', value: stats.stats.totalOrders, color: '#1E40AF' },
                { label: 'Customers', value: stats.stats.totalCustomers, color: '#065F46' },
                { label: 'Revenue', value: `Rs. ${stats.stats.totalRevenue?.toLocaleString()}`, color: '#5B21B6' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontSize: '12px', color: '#8B6A4A', marginBottom: '6px' }}>{label}</div>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: '600', color }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '16px', color: '#2C1A0E', marginBottom: '14px' }}>Recent Orders</h3>
                {stats.recentOrders?.map(order => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F2EDD8', gap: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#2C1A0E' }}>#{order.id} — {order.user?.name}</div>
                      <div style={{ fontSize: '12px', color: '#8B6A4A' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span style={{ background: STATUS_COLORS[order.status]?.bg, color: STATUS_COLORS[order.status]?.color, padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '500', flexShrink: 0 }}>{order.status}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '16px', color: '#2C1A0E', marginBottom: '14px' }}>Low Stock Alert</h3>
                {stats.lowStock?.length === 0
                  ? <div style={{ color: '#8B6A4A', fontSize: '14px' }}>All products well stocked</div>
                  : stats.lowStock?.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F2EDD8' }}>
                      <div style={{ fontSize: '13px', color: '#2C1A0E', fontWeight: '500' }}>{p.name}</div>
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '500' }}>{p.stock} left</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* ── Products ── */}
        {tab === 'Products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2C1A0E', margin: 0 }}>Products ({products.length})</h2>
              <button onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '', isActive: true }) }}
                style={{ background: '#E8C547', color: '#2C1A0E', border: 'none', padding: '9px 18px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'inherit' }}>
                + Add Product
              </button>
            </div>

            {showProductForm && (
              <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '17px', color: '#2C1A0E', marginBottom: '16px' }}>{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {[['name','Name *','text'],['price','Price (Rs.) *','number'],['stock','Stock','number'],['imageUrl','Image URL','url']].map(([f, label, type]) => (
                    <div key={f}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} value={productForm[f]} onChange={pf(f)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select value={productForm.categoryId} onChange={pf('categoryId')} style={{ ...inputStyle, background: '#FEFCF7' }}>
                      <option value="">No category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Description</label>
                    <textarea value={productForm.description} onChange={pf('description')} rows={2} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
                  </div>
                </div>
                {productError && <div style={{ color: '#991B1B', fontSize: '13px', marginTop: '10px' }}>{productError}</div>}
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button onClick={saveProduct} style={{ background: '#E8C547', color: '#2C1A0E', border: 'none', padding: '9px 22px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', fontSize: '13px' }}>Save</button>
                  <button onClick={() => setShowProductForm(false)} style={{ background: 'none', border: '1px solid #E8DFC8', color: '#8B6A4A', padding: '9px 22px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Mobile: cards, Desktop: table */}
            <div className="admin-desktop-table">
              <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: '#F2EDD8' }}>
                      {['Product','Category','Price','Stock','Status','Actions'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#8B6A4A', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p.id} style={{ borderTop: '1px solid #EDE4C4', background: i % 2 === 0 ? '#fff' : '#FEFCF7' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={p.imageUrl || `https://picsum.photos/seed/${p.id}/36/36`} alt={p.name} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', fontWeight: '500', color: '#2C1A0E' }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#8B6A4A' }}>{p.category?.name || '—'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: '500', color: '#8B5E3C', whiteSpace: 'nowrap' }}>Rs. {p.price?.toLocaleString()}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: p.stock <= 5 ? '#FEF3C7' : '#D1FAE5', color: p.stock <= 5 ? '#92400E' : '#065F46', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '500' }}>{p.stock}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: p.isActive ? '#D1FAE5' : '#FEE2E2', color: p.isActive ? '#065F46' : '#991B1B', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{p.isActive ? 'Active' : 'Hidden'}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => editProduct(p)} style={{ background: '#F2EDD8', border: 'none', color: '#8B5E3C', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>Edit</button>
                            <button onClick={() => deleteProduct(p.id)} style={{ background: '#FEE2E2', border: 'none', color: '#991B1B', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile product cards */}
            <div className="admin-mobile-cards">
              {products.map(p => (
                <div key={p.id} style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <img src={p.imageUrl || `https://picsum.photos/seed/${p.id}/48/48`} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '500', color: '#2C1A0E', fontSize: '14px', marginBottom: '3px' }}>{p.name}</div>
                    <div style={{ fontSize: '13px', color: '#8B5E3C', fontWeight: '600' }}>Rs. {p.price?.toLocaleString()}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: p.stock <= 5 ? '#FEF3C7' : '#D1FAE5', color: p.stock <= 5 ? '#92400E' : '#065F46', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>Stock: {p.stock}</span>
                      <span style={{ background: p.isActive ? '#D1FAE5' : '#FEE2E2', color: p.isActive ? '#065F46' : '#991B1B', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>{p.isActive ? 'Active' : 'Hidden'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      <button onClick={() => editProduct(p)} style={{ background: '#F2EDD8', border: 'none', color: '#8B5E3C', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>Edit</button>
                      <button onClick={() => deleteProduct(p.id)} style={{ background: '#FEE2E2', border: 'none', color: '#991B1B', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Categories ── */}
        {tab === 'Categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2C1A0E', margin: 0 }}>Categories</h2>
              <button onClick={() => setShowCatForm(!showCatForm)} style={{ background: '#E8C547', color: '#2C1A0E', border: 'none', padding: '9px 18px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'inherit' }}>+ Add Category</button>
            </div>
            {showCatForm && (
              <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Name *</label>
                    <input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <input value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} onFocus={e => e.target.style.borderColor = '#C4956A'} onBlur={e => e.target.style.borderColor = '#E8DFC8'} />
                  </div>
                </div>
                {catError && <div style={{ color: '#991B1B', fontSize: '13px', marginTop: '10px' }}>{catError}</div>}
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <button onClick={saveCategory} style={{ background: '#E8C547', color: '#2C1A0E', border: 'none', padding: '9px 22px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', fontSize: '13px' }}>Save</button>
                  <button onClick={() => setShowCatForm(false)} style={{ background: 'none', border: '1px solid #E8DFC8', color: '#8B6A4A', padding: '9px 22px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#2C1A0E', marginBottom: '3px', fontSize: '14px' }}>{cat.name}</div>
                    <div style={{ fontSize: '12px', color: '#8B6A4A' }}>{cat._count?.products || 0} products</div>
                  </div>
                  <button onClick={() => deleteCategory(cat.id)} style={{ background: '#FEE2E2', border: 'none', color: '#991B1B', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Orders ── */}
        {tab === 'Orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2C1A0E', margin: 0 }}>
                Orders <span style={{ fontSize: '14px', color: '#8B6A4A', fontFamily: 'inherit', fontWeight: '400' }}>({filteredOrders.length} of {orders.length})</span>
              </h2>
            </div>

            {/* Search + filter bar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E8DFC8', borderRadius: '24px', padding: '0 14px', gap: '8px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input
                  placeholder="Search by Order ID, customer name or email..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'inherit', color: '#2C1A0E', background: 'transparent', padding: '10px 0' }}
                />
                {orderSearch && (
                  <button onClick={() => setOrderSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B09070', fontSize: '16px', lineHeight: 1 }}>×</button>
                )}
              </div>
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #E8DFC8', borderRadius: '20px', fontSize: '13px', fontFamily: 'inherit', background: '#fff', color: '#2C1A0E', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">All statuses</option>
                {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#8B6A4A', background: '#fff', borderRadius: '12px', border: '1px solid #EDE4C4' }}>
                No orders found for "{orderSearch}"
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="admin-desktop-table">
                  <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                      <thead>
                        <tr style={{ background: '#F2EDD8' }}>
                          {['Order ID','Customer','Items','Total','Payment','Status','Update Status'].map(h => (
                            <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#8B6A4A', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o, i) => (
                          <tr key={o.id}
                            style={{ borderTop: '1px solid #EDE4C4', background: i % 2 === 0 ? '#fff' : '#FEFCF7', cursor: 'pointer' }}
                            onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)}
                          >
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: '700', color: '#2C1A0E', fontSize: '14px' }}>#{o.id}</div>
                              <div style={{ fontSize: '11px', color: '#8B6A4A' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontSize: '13px', fontWeight: '500', color: '#2C1A0E' }}>{o.user?.name}</div>
                              <div style={{ fontSize: '11px', color: '#8B6A4A' }}>{o.user?.email}</div>
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6B4C3B' }}>{o.items?.length} items</td>
                            <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: '500', color: '#8B5E3C', whiteSpace: 'nowrap' }}>Rs. {o.totalAmount?.toLocaleString()}</td>
                            <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6B4C3B' }}>{o.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' : 'eSewa'}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color, padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '500' }}>{o.status}</span>
                            </td>
                            <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                              <select
                                value={o.status}
                                onChange={e => updateOrderStatus(o.id, e.target.value)}
                                style={{ padding: '5px 8px', border: '1px solid #E8DFC8', borderRadius: '8px', fontSize: '12px', fontFamily: 'inherit', background: '#FEFCF7', color: '#2C1A0E', cursor: 'pointer', outline: 'none' }}
                              >
                                {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile order cards */}
                <div className="admin-mobile-cards" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredOrders.map(o => (
                    <div key={o.id} style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                        onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)}>
                        <div>
                          <div style={{ fontWeight: '700', color: '#2C1A0E', fontSize: '15px' }}>Order #{o.id}</div>
                          <div style={{ fontSize: '13px', color: '#8B6A4A', marginTop: '2px' }}>{o.user?.name} · {new Date(o.createdAt).toLocaleDateString()}</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#8B5E3C', marginTop: '4px' }}>Rs. {o.totalAmount?.toLocaleString()}</div>
                        </div>
                        <span style={{ background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color, padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '500', flexShrink: 0 }}>{o.status}</span>
                      </div>
                      {selectedOrder?.id === o.id && (
                        <div style={{ borderTop: '1px solid #EDE4C4', padding: '14px 16px' }}>
                          <div style={{ fontSize: '13px', color: '#6B4C3B', marginBottom: '10px' }}>
                            <span style={{ fontWeight: '500' }}>Address:</span> {o.deliveryAddress}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6B4C3B', marginBottom: '12px' }}>
                            <span style={{ fontWeight: '500' }}>Payment:</span> {o.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'eSewa'}
                          </div>
                          <div style={{ marginBottom: '12px' }}>
                            {o.items?.map(item => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#2C1A0E' }}>
                                <span>{item.product?.name} × {item.quantity}</span>
                                <span style={{ fontWeight: '500' }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <label style={{ ...labelStyle, marginBottom: '6px' }}>Update Status</label>
                          <select
                            value={o.status}
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #E8DFC8', borderRadius: '10px', fontSize: '13px', fontFamily: 'inherit', background: '#FEFCF7', color: '#2C1A0E', outline: 'none' }}
                          >
                            {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Order detail panel — desktop */}
                {selectedOrder && (
                  <div className="admin-desktop-table" style={{ marginTop: '20px', background: '#fff', border: '1px solid #EDE4C4', borderRadius: '14px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2C1A0E', margin: '0 0 4px' }}>Order #{selectedOrder.id}</h3>
                        <div style={{ fontSize: '13px', color: '#8B6A4A' }}>Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: '1px solid #E8DFC8', color: '#8B6A4A', padding: '6px 14px', borderRadius: '16px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Close</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                      {[
                        { label: 'Customer', value: selectedOrder.user?.name },
                        { label: 'Email', value: selectedOrder.user?.email },
                        { label: 'Payment', value: selectedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'eSewa' },
                        { label: 'Total', value: `Rs. ${selectedOrder.totalAmount?.toLocaleString()}` },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: '#F2EDD8', borderRadius: '10px', padding: '14px' }}>
                          <div style={{ fontSize: '11px', color: '#8B6A4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#2C1A0E', wordBreak: 'break-word' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '11px', color: '#8B6A4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Delivery Address</div>
                      <div style={{ fontSize: '14px', color: '#2C1A0E', background: '#F2EDD8', padding: '12px', borderRadius: '10px' }}>{selectedOrder.deliveryAddress}</div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '11px', color: '#8B6A4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Items Ordered</div>
                      {selectedOrder.items?.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F2EDD8' }}>
                          <img src={item.product?.imageUrl || `https://picsum.photos/seed/${item.productId}/44/44`} alt={item.product?.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#2C1A0E' }}>{item.product?.name}</div>
                            <div style={{ fontSize: '12px', color: '#8B6A4A' }}>x{item.quantity} × Rs. {item.price?.toLocaleString()}</div>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#8B5E3C' }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Customers ── */}
        {tab === 'Customers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2C1A0E', margin: 0 }}>Customers ({customers.length})</h2>
              <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E8DFC8', borderRadius: '24px', padding: '0 14px', gap: '8px', minWidth: '220px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input
                  placeholder="Search name or email..."
                  value={customerSearch}
                  onChange={e => {
                    setCustomerSearch(e.target.value)
                    api.get(`/admin/customers?search=${e.target.value}`).then(r => setCustomers(r.data.data.customers)).catch(() => {})
                  }}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'inherit', color: '#2C1A0E', background: 'transparent', padding: '10px 0' }}
                />
              </div>
            </div>

            {/* Desktop table */}
            <div className="admin-desktop-table">
              <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                  <thead>
                    <tr style={{ background: '#F2EDD8' }}>
                      {['Name','Email','Phone','Orders','Joined'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#8B6A4A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={c.id} style={{ borderTop: '1px solid #EDE4C4', background: i % 2 === 0 ? '#fff' : '#FEFCF7' }}>
                        <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: '500', color: '#2C1A0E' }}>{c.name}</td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6B4C3B' }}>{c.email}</td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6B4C3B' }}>{c.phone || '—'}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#F2EDD8', color: '#8B5E3C', padding: '3px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '500' }}>{c._count?.orders} orders</span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#8B6A4A' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile customer cards */}
            <div className="admin-mobile-cards" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {customers.map(c => (
                <div key={c.id} style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '500', color: '#2C1A0E', fontSize: '14px' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#8B6A4A', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
                    <div style={{ fontSize: '12px', color: '#8B6A4A', marginTop: '1px' }}>{c.phone || 'No phone'} · Joined {new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span style={{ background: '#F2EDD8', color: '#8B5E3C', padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '500', flexShrink: 0 }}>{c._count?.orders} orders</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

        {/* ── Reports ── */}
        {tab === 'Reports' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2C1A0E', margin: 0 }}>Revenue Reports</h2>
              <select
                value={reportYear}
                onChange={e => setReportYear(parseInt(e.target.value))}
                style={{ padding: '9px 14px', border: '1px solid #E8DFC8', borderRadius: '20px', fontSize: '13px', fontFamily: 'inherit', background: '#fff', color: '#2C1A0E', outline: 'none', cursor: 'pointer' }}
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {!reports ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#8B6A4A' }}>Loading reports...</div>
            ) : (
              <div>
                {/* Top products */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                  <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '14px', padding: '24px', gridColumn: 'span 2' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', color: '#2C1A0E', marginBottom: '20px' }}>Monthly Revenue — {reportYear}</h3>

                    {/* Bar chart */}
                    {reports.monthly && reports.monthly.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', padding: '0 8px' }}>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = reports.monthly.find(m => parseInt(m.month) === i + 1)
                          const revenue = month ? parseFloat(month.revenue) : 0
                          const maxRevenue = Math.max(...reports.monthly.map(m => parseFloat(m.revenue)), 1)
                          const height = Math.max((revenue / maxRevenue) * 140, revenue > 0 ? 8 : 2)
                          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                              {revenue > 0 && (
                                <div style={{ fontSize: '10px', color: '#8B5E3C', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                  {revenue >= 1000 ? `${(revenue/1000).toFixed(1)}k` : revenue}
                                </div>
                              )}
                              <div style={{ width: '100%', height: `${height}px`, background: revenue > 0 ? '#E8C547' : '#F2EDD8', borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease', minHeight: '3px' }} />
                              <div style={{ fontSize: '10px', color: '#8B6A4A', fontWeight: '500' }}>{months[i]}</div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#8B6A4A', fontSize: '14px' }}>
                        No revenue data for {reportYear} yet
                      </div>
                    )}
                  </div>

                  {/* Top products */}
                  <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '14px', padding: '24px' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', color: '#2C1A0E', marginBottom: '16px' }}>Top Selling Products</h3>
                    {reports.topProducts?.length === 0 ? (
                      <div style={{ color: '#8B6A4A', fontSize: '14px' }}>No sales data yet</div>
                    ) : reports.topProducts?.map((p, i) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F2EDD8' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? '#E8C547' : i === 1 ? '#EDE4C4' : '#F2EDD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#2C1A0E', flexShrink: 0 }}>{i + 1}</div>
                        <img src={p.imageUrl || `https://picsum.photos/seed/${p.id}/32/32`} alt={p.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#2C1A0E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#8B5E3C', flexShrink: 0 }}>{p.totalSold} sold</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly table */}
                <div style={{ background: '#fff', border: '1px solid #EDE4C4', borderRadius: '14px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F2EDD8' }}>
                        {['Month', 'Revenue (Rs.)', 'Transactions'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#8B6A4A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((month, i) => {
                        const data = reports.monthly?.find(m => parseInt(m.month) === i + 1)
                        return (
                          <tr key={month} style={{ borderTop: '1px solid #EDE4C4', background: i % 2 === 0 ? '#fff' : '#FEFCF7' }}>
                            <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#2C1A0E' }}>{month}</td>
                            <td style={{ padding: '12px 16px', fontSize: '14px', color: data ? '#8B5E3C' : '#B09070', fontWeight: data ? '600' : '400' }}>
                              {data ? `Rs. ${parseFloat(data.revenue).toLocaleString()}` : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '14px', color: data ? '#2C1A0E' : '#B09070' }}>
                              {data ? data.transactions : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      <style>{`
        .admin-mobile-cards { display: none; }
        @media (max-width: 768px) {
          .admin-desktop-table { display: none; }
          .admin-mobile-cards { display: flex !important; flex-direction: column; gap: 12px; }
        }
      `}</style>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '8px' }
const inputStyle = { width: '100%', padding: '11px 14px', border: '1px solid #E8DFC8', borderRadius: '10px', fontSize: '14px', color: '#2C1A0E', background: '#FEFCF7', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }
