import { z } from 'zod'

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// ─── Products ────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().optional(),
  price: z.number().int().positive('Price must be a positive integer'),
  imageUrl: z.string().optional(),
  imageType: z.enum(['device', 'bundle', 'sub']).default('device'),
  sku: z.string().min(1, 'SKU is required').max(100),
  isActive: z.boolean().default(true)
})

export const updateProductSchema = createProductSchema.partial()

// ─── Orders ──────────────────────────────────────────────────────────────────

export const billingDetailsSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  npwp: z.string().optional().default(''),
  nik: z.string().optional().default(''),
  email: z.string().email('Invalid email address')
})

export const vesselDetailsSchema = z.object({
  vesselName: z.string().optional().default(''),
  vesselId: z.string().optional().default(''),
  serialNumber: z.string().optional().default(''),
  transmitterId: z.string().optional().default('')
})

export const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  productName: z.string().optional(),
  productSku: z.string().optional(),
  unitPrice: z.number().int().positive().optional(),
  lineTotal: z.number().int().positive().optional()
})

export const createOrderSchema = z.object({
  billingDetails: billingDetailsSchema,
  vesselDetails: vesselDetailsSchema.optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required')
})

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending_payment',
    'payment_uploaded',
    'verified',
    'processing',
    'completed',
    'cancelled'
  ]),
  adminNotes: z.string().optional()
})

// Status State Machine for transition validation
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ['payment_uploaded', 'cancelled'],
  payment_uploaded: ['verified', 'cancelled'],
  verified: ['completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: [] // Terminal state
}

export const isValidTransition = (currentStatus: string, newStatus: string): boolean => {
  const allowedNext = VALID_STATUS_TRANSITIONS[currentStatus] || []
  return allowedNext.includes(newStatus)
}

// ─── Type Exports ────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
