import { db } from '../../db'
import { products } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '0')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid ID' })
  }

  const [product] = await db.select().from(products).where(eq(products.id, id))

  if (!product) {
    throw createError({ statusCode: 404, message: 'Product not found' })
  }

  return product
})
