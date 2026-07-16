import { db } from '../../db'
import { orders, orderItems } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

    const [order] = await db.select().from(orders).where(eq(orders.id, id))
    if (!order) throw createError({ statusCode: 404, message: 'Order not found' })

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))

    return {
      ...order,
      items
    }
  } catch (error) {
    if ((error as any).statusCode) throw error
    throw createError({ statusCode: 500, message: 'Failed to fetch order details' })
  }
})
