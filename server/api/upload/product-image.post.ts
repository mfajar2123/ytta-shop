import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, message: 'No file uploaded' })
    }

    const file = formData.find(part => part.name === 'image')
    if (!file || !file.filename || !file.data) {
      throw createError({ statusCode: 400, message: 'Invalid file format' })
    }

    // Validate MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type || '')) {
      throw createError({ statusCode: 400, message: 'Only JPG, PNG, and WebP images are allowed' })
    }

    // Prepare directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    // Save file
    const ext = file.filename.split('.').pop()
    const fileName = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`
    const filePath = join(uploadDir, fileName)

    writeFileSync(filePath, file.data)

    return {
      message: 'Upload successful',
      url: `/uploads/products/${fileName}`
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'Failed to process file upload' })
  }
})
