import { db } from '../../db'
import { products, orders } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Ensure authentication
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // Get total active products
  const productsResult = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true))
  const totalProducts = Number(productsResult[0].count) || 0

  // Get total orders
  const ordersResult = await db.select({ count: sql<number>`count(*)` }).from(orders)
  const totalOrders = Number(ordersResult[0].count) || 0

  // Get pending payment orders
  const pendingResult = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'pending_payment'))
  const pendingOrders = Number(pendingResult[0].count) || 0

  // Get total revenue from completed orders
  const revenueResult = await db.select({ total: sql<number>`sum(${orders.total})` }).from(orders).where(eq(orders.status, 'completed'))
  const totalRevenue = Number(revenueResult[0].total) || 0

  // Get recent orders (last 5)
  const recentOrders = await db.select()
    .from(orders)
    .orderBy(sql`${orders.createdAt} DESC`)
    .limit(5)

  // Get some active products for preview
  const recentProducts = await db.select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(sql`${products.createdAt} DESC`)
    .limit(4)

  return {
    totalProducts,
    totalOrders,
    pendingOrders,
    totalRevenue,
    recentOrders,
    recentProducts
  }
})
