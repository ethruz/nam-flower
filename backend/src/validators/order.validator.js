import { z } from 'zod'

export const createOrderSchema = z.object({
  paymentMethod: z.enum(['ESEWA', 'CASH_ON_DELIVERY']),
  deliveryAddress: z.string().min(5, 'Delivery address required'),
  deliveryDate: z.string().optional()
})
