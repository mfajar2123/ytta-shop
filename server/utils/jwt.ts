import jwt from 'jsonwebtoken'

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not defined in environment variables')
  return secret
}

const getExpiry = (): string => {
  return process.env.JWT_EXPIRY || '8h'
}

export interface JwtPayload {
  sub: string       // admin UUID
  email: string
  role: string
  fullName: string
}

export const signToken = (payload: JwtPayload, expiresIn?: string): string => {
  return jwt.sign(payload, getSecret(), {
    expiresIn: expiresIn || getExpiry()
  })
}

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getSecret()) as JwtPayload
}
