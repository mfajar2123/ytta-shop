import { db } from '../../db'
import { orders } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateOrderSchema = z.object({
  billingDetails: z.any().optional(),
  vesselDetails: z.any().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

    const user = event.context.user
    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const body = await readBody(event)
    const { billingDetails, vesselDetails } = updateOrderSchema.parse(body)

    const [existing] = await db.select().from(orders).where(eq(orders.id, id))
    if (!existing) {
      throw createError({ statusCode: 404, message: 'Order not found' })
    }

    const updateData: any = { updatedAt: new Date() }
    
    if (billingDetails) {
      updateData.billingDetails = { ...existing.billingDetails, ...billingDetails }
    }
    
    if (vesselDetails) {
      updateData.vesselDetails = { ...existing.vesselDetails, ...vesselDetails }
    }

    const [updatedOrder] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning()

    return updatedOrder
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Validation failed', data: error.errors })
    }
    console.error('Update order error:', error)
    throw createError({ statusCode: 500, message: 'Failed to update order details' })
  }
})
