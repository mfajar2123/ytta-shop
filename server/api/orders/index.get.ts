import { db } from '../../db'
import { orders } from '../../db/schema'
import { desc, eq, like, or, and, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const status = query.status as string
    const search = query.search as string
    
    let conditions = []
    
    if (status && status !== 'all') {
      conditions.push(eq(orders.status, status as any))
    }
    
    if (search) {
      conditions.push(
        or(
          like(orders.invoiceNumber, `%${search}%`),
          like(orders.customerEmail, `%${search}%`),
          like(orders.customerPhone, `%${search}%`)
        )
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(orders)
      .where(whereClause)
      
    // Get paginated data
    const items = await db.select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    return {
      items,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    }
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch orders' })
  }
})
