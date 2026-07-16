import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { db } from '../../db'
import { orders } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, message: 'No file uploaded' })
    }

    const orderIdPart = formData.find(part => part.name === 'orderId')
    if (!orderIdPart || !orderIdPart.data) {
      throw createError({ statusCode: 400, message: 'Missing order ID' })
    }
    const orderId = orderIdPart.data.toString()

    // Verify order exists
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId))
    if (!order) {
      throw createError({ statusCode: 404, message: 'Order not found' })
    }

    const file = formData.find(part => part.name === 'proof')
    if (!file || !file.filename || !file.data) {
      throw createError({ statusCode: 400, message: 'Invalid file format' })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type || '')) {
      throw createError({ statusCode: 400, message: 'Only JPG, PNG, WebP, and PDF are allowed' })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'proofs')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const ext = file.filename.split('.').pop()
    const fileName = `proof-${orderId}-${Date.now()}.${ext}`
    const filePath = join(uploadDir, fileName)

    writeFileSync(filePath, file.data)
    
    const paymentProofUrl = `/uploads/proofs/${fileName}`

    // Update order with proof URL and change status
    await db.update(orders)
      .set({ 
        paymentProofUrl, 
        status: 'payment_uploaded',
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))

    try {
      const { ensureTemplate, getTransporter } = await import('../../utils/email')
      const ejs = (await import('ejs')).default
      
      const html = await ejs.renderFile(
        ensureTemplate('payment-uploaded.ejs', `<h1>Payment Uploaded</h1><p>Order ${order.invoiceNumber} has a new payment proof.</p>`), 
        { order }
      )
      
      await getTransporter().sendMail({
        from: '"Imani Shop" <mfajar212345@gmail.com>',
        to: ['mfajar212345@gmail.com'],
        subject: `Payment Uploaded - ${order.invoiceNumber}`,
        html,
        attachments: [{ filename: fileName, content: file.data }]
      })
    } catch (e) {
      console.error('Failed to send payment uploaded email:', e)
    }
    return {
      message: 'Payment proof uploaded successfully',
      url: paymentProofUrl
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'Failed to process file upload' })
  }
})
