import { db } from '../../db'
import { admins } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { comparePassword } from '../../utils/password'
import { signToken } from '../../utils/jwt'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  rememberMe: z.boolean().optional()
})

// Simple in-memory rate limiter (5 attempts per minute per IP)
const rateLimit = new Map<string, { count: number, resetAt: number }>()

export default defineEventHandler(async (event) => {
  try {
    // ── Rate Limiting ────────────────────────────────────────────────
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const now = Date.now()
    
    let limiter = rateLimit.get(ip)
    if (!limiter || limiter.resetAt < now) {
      limiter = { count: 0, resetAt: now + 60 * 1000 }
    }
    
    if (limiter.count >= 5) {
      throw createError({ statusCode: 429, message: 'Too many login attempts. Please try again in a minute.' })
    }
    
    limiter.count++
    rateLimit.set(ip, limiter)
    // ─────────────────────────────────────────────────────────────────

    const body = await readBody(event)
    const { username, password, rememberMe } = loginSchema.parse(body)

    const [admin] = await db.select().from(admins).where(eq(admins.username, username))

    if (!admin) {
      throw createError({ statusCode: 401, message: 'Invalid credentials' })
    }

    const isValid = await comparePassword(password, admin.passwordHash)
    if (!isValid) {
      throw createError({ statusCode: 401, message: 'Invalid credentials' })
    }

    const token = signToken({
      sub: admin.id,
      username: admin.username,
      role: admin.role,
      fullName: admin.fullName
    }, rememberMe ? '3d' : '8h') // Passing expiry to signToken, so we need to update utils/jwt.ts too!

    setCookie(event, 'admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 3 * 24 * 60 * 60 : 8 * 60 * 60 // 3 days or 8 hours
    })

    // Reset rate limiter on successful login
    rateLimit.delete(ip)

    return {
      message: 'Logged in successfully',
      user: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role
      }
    }

  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Invalid input data' })
    }
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'Login failed' })
  }
})
