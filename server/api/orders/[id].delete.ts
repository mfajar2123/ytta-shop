import { db } from '../../db'
import { orders, orderItems } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

    const user = event.context.user
    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

    // Check if order exists
    const [existing] = await db.select().from(orders).where(eq(orders.id, id))
    if (!existing) {
      throw createError({ statusCode: 404, message: 'Order not found' })
    }

    // Delete in transaction
    await db.transaction(async (tx) => {
      await tx.delete(orderItems).where(eq(orderItems.orderId, id))
      await tx.delete(orders).where(eq(orders.id, id))
    })

    return { message: 'Order deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Delete order error:', error)
    throw createError({ statusCode: 500, message: 'Failed to delete order' })
  }
})
