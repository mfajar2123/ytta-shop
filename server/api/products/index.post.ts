import { db } from '../../db'
import { products } from '../../db/schema'
import { createProductSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = createProductSchema.parse(body)

    // Generate slug from name
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`

    const [newProduct] = await db.insert(products).values({
      ...data,
      slug
    }).returning()

    return newProduct
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Validation failed', data: error.errors })
    }
    throw createError({ statusCode: 500, message: 'Failed to create product' })
  }
})
