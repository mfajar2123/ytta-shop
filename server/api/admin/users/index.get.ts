import { db } from '../../../db'
import { admins } from '../../../db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const userList = await db.select({
      id: admins.id,
      username: admins.username,
      fullName: admins.fullName,
      role: admins.role,
      createdAt: admins.createdAt
    }).from(admins).orderBy(desc(admins.createdAt))

    return userList
  } catch (error: any) {
    console.error('Fetch users error:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch users' })
  }
})
