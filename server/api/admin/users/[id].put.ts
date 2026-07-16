import { db } from '../../../db'
import { admins } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../../../utils/password'
import { z } from 'zod'

const updateUserSchema = z.object({
  username: z.string().min(3).max(255).optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  fullName: z.string().min(1).max(255).optional(),
  role: z.enum(['admin', 'superadmin']).optional()
})

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

    const body = await readBody(event)
    const data = updateUserSchema.parse(body)

    const updateData: any = {}
    if (data.username) updateData.username = data.username
    if (data.fullName) updateData.fullName = data.fullName
    if (data.role) updateData.role = data.role
    if (data.password && data.password.trim() !== '') {
      updateData.passwordHash = await hashPassword(data.password)
    }

    if (Object.keys(updateData).length === 0) {
      return { message: 'No changes provided' }
    }

    updateData.updatedAt = new Date()

    const [updatedUser] = await db.update(admins)
      .set(updateData)
      .where(eq(admins.id, id))
      .returning({
        id: admins.id,
        username: admins.username,
        fullName: admins.fullName,
        role: admins.role,
        updatedAt: admins.updatedAt
      })

    if (!updatedUser) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    return updatedUser
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Invalid input data', data: error.errors })
    }
    // Handle unique constraint violation (duplicate username)
    if (error.code === '23505') {
      throw createError({ statusCode: 409, message: 'Username already exists' })
    }
    console.error('Update user error:', error)
    throw createError({ statusCode: 500, message: 'Failed to update user' })
  }
})
