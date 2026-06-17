import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { user, token } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const signup = async (name, email, password, phone) => {
    const res = await api.post('/auth/signup', { name, email, password, phone })
    const { user, token } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
