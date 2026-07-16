import { db } from '../../../db'
import { admins } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

    const currentUser = event.context.user
    if (!currentUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

    if (currentUser.sub === id) {
      throw createError({ statusCode: 403, message: 'You cannot delete your own account' })
    }

    const [deletedUser] = await db.delete(admins)
      .where(eq(admins.id, id))
      .returning({ id: admins.id })

    if (!deletedUser) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    return { message: 'User deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Delete user error:', error)
    throw createError({ statusCode: 500, message: 'Failed to delete user' })
  }
})
