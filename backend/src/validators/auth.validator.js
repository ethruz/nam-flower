import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional()
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional()
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  return true
}, { message: 'Current password is required to set a new password' })
