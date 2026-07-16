import { db } from '../../db'
import { orders, orderItems, products } from '../../db/schema'
import { createOrderSchema } from '../../utils/validation'
import { eq, inArray } from 'drizzle-orm'
// TODO: import email and pdf services once created

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear()
  // simple sequential number for this example, in production should be atomic
  const allOrders = await db.select({ id: orders.id }).from(orders)
  const nextNumber = String(allOrders.length + 1).padStart(5, '0')
  return `INV.${year}.SC.${nextNumber}`
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = createOrderSchema.parse(body)

    // Verify products and calculate total on server side
    const productIds = data.items.map(item => item.productId)
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds))
    
    let subtotal = 0
    const verifiedItems = data.items.map(item => {
      const dbProduct = dbProducts.find(p => p.id === item.productId)
      if (!dbProduct) throw createError({ statusCode: 400, message: `Product ${item.productId} not found` })
      
      const lineTotal = dbProduct.price * item.quantity
      subtotal += lineTotal
      
      return {
        productId: dbProduct.id,
        productName: dbProduct.name,
        productSku: dbProduct.sku,
        quantity: item.quantity,
        unitPrice: dbProduct.price,
        lineTotal
      }
    })

    const uniqueCode = Math.floor(Math.random() * 90) + 10 // 10 to 99
    const total = subtotal + uniqueCode
    const invoiceNumber = await generateInvoiceNumber()

    // Transaction to insert order and items
    const newOrder = await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values({
        invoiceNumber,
        status: 'pending_payment',
        subtotal,
        uniqueCode,
        total,
        billingDetails: data.billingDetails,
        vesselDetails: data.vesselDetails || null,
        customerEmail: data.billingDetails.email,
        customerPhone: data.billingDetails.phone
      }).returning()

      await tx.insert(orderItems).values(
        verifiedItems.map(item => ({
          orderId: order.id,
          ...item
        }))
      )

      return order
    })

    try {
      const { generateInvoicePDF } = await import('../../utils/pdf')
      const { sendOrderPlacedEmail } = await import('../../utils/email')
      
      const pdfBuffer = await generateInvoicePDF(newOrder, verifiedItems)
      await sendOrderPlacedEmail(newOrder, verifiedItems, pdfBuffer)
    } catch (emailError) {
      console.error('Failed to send order placed email:', emailError)
      // Continue anyway since the order was successfully saved
    }

    return {
      message: 'Order created successfully',
      order: newOrder
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Validation failed', data: error.errors })
    }
    console.error('Order creation error:', error)
    throw createError({ statusCode: 500, message: 'Failed to create order' })
  }
})
