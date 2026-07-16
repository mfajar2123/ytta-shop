import { db } from '../../db'
import { products } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { logAdminAction } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid ID' })

    // Soft delete
    const [deletedProduct] = await db.update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()

    if (!deletedProduct) {
      throw createError({ statusCode: 404, message: 'Product not found' })
    }

    logAdminAction(event, 'DELETE', 'PRODUCT', id.toString(), { before: deletedProduct })

    return { message: 'Product deleted successfully' }
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Failed to delete product' })
  }
})
