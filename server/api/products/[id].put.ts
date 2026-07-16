import { db } from '../../db'
import { products } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { updateProductSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid ID' })

    const body = await readBody(event)
    const data = updateProductSchema.parse(body)

    const [updatedProduct] = await db.update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()

    if (!updatedProduct) {
      throw createError({ statusCode: 404, message: 'Product not found' })
    }

    return updatedProduct
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Validation failed', data: error.errors })
    }
    throw createError({ statusCode: 500, message: 'Failed to update product' })
  }
})
