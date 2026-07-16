import { db } from '../../db'
import { products } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const allProducts = await db.select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt))

    return allProducts
  } catch (error) {
    console.error('Failed to fetch products error details:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch products'
    })
  }
})
