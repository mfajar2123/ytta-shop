import { db } from '../../../db'
import { admins } from '../../../db/schema'
import { hashPassword } from '../../../utils/password'
import { z } from 'zod'
import { logAdminAction } from '../../../utils/logger'

const createUserSchema = z.object({
  username: z.string().min(3).max(255),
  password: z.string().min(6),
  fullName: z.string().min(1).max(255),
  role: z.enum(['admin', 'superadmin'])
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password, fullName, role } = createUserSchema.parse(body)

    const hashedPassword = await hashPassword(password)

    const [newUser] = await db.insert(admins).values({
      username,
      passwordHash: hashedPassword,
      fullName,
      role
    }).returning({
      id: admins.id,
      username: admins.username,
      fullName: admins.fullName,
      role: admins.role,
      createdAt: admins.createdAt
    })

    logAdminAction(event, 'CREATE', 'USER', newUser.id, { after: newUser })

    return newUser
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Invalid input data', data: error.errors })
    }
    // Handle unique constraint violation (duplicate username)
    if (error.code === '23505') {
      throw createError({ statusCode: 409, message: 'Username already exists' })
    }
    console.error('Create user error:', error)
    throw createError({ statusCode: 500, message: 'Failed to create user' })
  }
})
