import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional(),
  categoryId: z.number().int().optional(),
  isActive: z.boolean().default(true)
})

export const updateProductSchema = createProductSchema.partial()

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name required'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional()
})

export const updateCategorySchema = createCategorySchema.partial()
