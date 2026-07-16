import { db } from '../../../db'
import { orders, orderItems } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { updateOrderStatusSchema, isValidTransition } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

    const user = event.context.user
    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const body = await readBody(event)
    const { status: newStatus, adminNotes } = updateOrderStatusSchema.parse(body)

    // Fetch current order to validate transition
    const [currentOrder] = await db.select().from(orders).where(eq(orders.id, id))
    if (!currentOrder) {
      throw createError({ statusCode: 404, message: 'Order not found' })
    }

    // ── Validate status transition ──────────────────────────────────────
    if (!isValidTransition(currentOrder.status, newStatus)) {
      throw createError({
        statusCode: 400,
        message: `Invalid status transition: cannot change from "${currentOrder.status}" to "${newStatus}"`
      })
    }

    // ── Build update payload ────────────────────────────────────────────
    const updateData: any = { status: newStatus, updatedAt: new Date() }
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes
    }

    if (newStatus === 'verified') {
      updateData.verifiedBy = user.sub
      updateData.paidAt = new Date()
    } else if (newStatus === 'completed') {
      updateData.completedAt = new Date()
    }

    const [updatedOrder] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning()

    if (!updatedOrder) {
      throw createError({ statusCode: 404, message: 'Order not found' })
    }

    // ── Trigger email notifications per status ──────────────────────────
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))

    let emailSent = true
    let emailErrorMsg = null

    try {
      if (newStatus === 'verified') {
        const { generateInvoicePDF } = await import('../../../utils/pdf')
        const { sendPaymentVerifiedEmail } = await import('../../../utils/email')
        
        const pdfBuffer = await generateInvoicePDF(updatedOrder, items)
        await sendPaymentVerifiedEmail(updatedOrder, pdfBuffer)

      } else if (newStatus === 'completed') {
        const { generateInvoicePDF } = await import('../../../utils/pdf')
        const { sendOrderCompletedEmail } = await import('../../../utils/email')
        const pdfBuffer = await generateInvoicePDF(updatedOrder, items)
        await sendOrderCompletedEmail(updatedOrder, pdfBuffer)
      } else if (newStatus === 'cancelled') {
        const { sendOrderCancelledEmail } = await import('../../../utils/email')
        await sendOrderCancelledEmail(updatedOrder)
      }
    } catch (emailError: any) {
      console.error(`[status.patch.ts] Failed to send ${newStatus} email:`, emailError)
      emailSent = false
      emailErrorMsg = emailError.message || 'SMTP Connection failed'
      // We purposefully DO NOT throw here. The order status was successfully updated in the DB, 
      // we don't want to revert or crash the client response just because of an email error.
    }

    return {
      ...updatedOrder,
      _meta: {
        emailSent,
        emailError: emailErrorMsg
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Validation failed', data: error.errors })
    }
    console.error('Status update error:', error)
    throw createError({ statusCode: 500, message: 'Failed to update order status' })
  }
})
