import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'ADMIN') return <Navigate to="/" />
  return children
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route path="/products/:id" element={<ProductDetail />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/payment/success" element={<PaymentSuccess />} />
    <Route path="/payment/failed" element={<PaymentFailed />} />
    <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
    <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
