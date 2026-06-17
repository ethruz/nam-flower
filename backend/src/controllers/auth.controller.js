import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/db.js'
import { signupSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator.js'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

export const signup = async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message })
    }

    const { name, email, password, phone } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    })

    const token = generateToken(user.id)

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, token }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during signup' })
  }
}

export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const token = generateToken(user.id)
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: userWithoutPassword, token }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during login' })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    })
    return res.status(200).json({ success: true, data: { user } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message })
    }

    const { name, phone, currentPassword, newPassword } = parsed.data
    const updateData = {}

    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone

    if (newPassword) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } })
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' })
      }
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true }
    })

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updated }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}
