import { db } from '../../db'
import { orders } from '../../db/schema'
import { desc, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Fetch actionable orders (e.g., waiting for payment proof check, or brand new orders)
    // To keep it simple, we fetch the latest 10 orders that need attention.
    const recentOrders = await db.select({
      id: orders.id,
      invoiceNumber: orders.invoiceNumber,
      status: orders.status,
      updatedAt: orders.updatedAt,
      customerEmail: orders.customerEmail,
      total: orders.total
    })
    .from(orders)
    .where(inArray(orders.status, ['pending_payment', 'payment_uploaded']))
    .orderBy(desc(orders.updatedAt))
    .limit(10)

    const notifications = recentOrders.map(o => {
      let title = ''
      let message = ''
      
      if (o.status === 'payment_uploaded') {
        title = 'Payment Proof Uploaded'
        message = `Order ${o.invoiceNumber} has a new payment proof ready for verification.`
      } else {
        title = 'New Order Placed'
        message = `Order ${o.invoiceNumber} is waiting for payment.`
      }

      return {
        id: o.id,
        title,
        message,
        time: o.updatedAt,
        type: o.status,
        link: `/admin/orders/${o.id}`
      }
    })

    return notifications
  } catch (error: any) {
    throw createError({ statusCode: 500, message: 'Failed to fetch notifications' })
  }
})
