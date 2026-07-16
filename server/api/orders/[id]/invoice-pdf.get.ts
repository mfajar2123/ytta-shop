import { db } from '../../../db'
import { orders, orderItems } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { generateInvoicePDF } from '../../../utils/pdf'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'Missing order ID' })

  const [order] = await db.select().from(orders).where(eq(orders.id, id))
  if (!order) throw createError({ statusCode: 404, message: 'Order not found' })

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))

  const pdfBuffer = await generateInvoicePDF(order, items)

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `inline; filename="${order.invoiceNumber}.pdf"`)

  return pdfBuffer
})
