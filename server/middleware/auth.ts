import { verifyToken } from '../utils/jwt'

export default defineEventHandler((event) => {
  // Only protect /api/admin/* and certain other endpoints if needed
  // Since we don't have an /api/admin prefix, we can check specific endpoints
  const path = event.path
  const cleanPath = path.split('?')[0].replace(/\/$/, '')
  
  const protectedRoutes = [
    '/api/products', // POST, PUT, DELETE needs auth, GET is public
    '/api/orders', // GET (list) needs auth, POST (create) is public
    '/api/upload',
    '/api/auth/me',
    '/api/dashboard',
    '/api/admin/users',
    '/api/admin/logs',
    '/api/admin/settings'
  ]

  const isProtected = protectedRoutes.some(route => cleanPath.startsWith(route))
  
  if (isProtected) {
    // If it's a GET or HEAD request to /api/products, it's public
    if (cleanPath.startsWith('/api/products') && (event.method === 'GET' || event.method === 'HEAD')) {
      return // Allow
    }
    
    // If it's a POST request to /api/orders (customer placing order), it's public
    if (cleanPath === '/api/orders' && event.method === 'POST') {
      return // Allow
    }

    const token = getCookie(event, 'admin_token')
    if (!token) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      throw createError({ statusCode: 401, message: 'Invalid or expired token' })
    }

    // Attach user to event context
    event.context.user = decoded

    // RBAC: Only superadmin can modify users (POST, PUT, DELETE /api/admin/users)
    if (cleanPath.startsWith('/api/admin/users') && ['POST', 'PUT', 'DELETE'].includes(event.method)) {
      if (decoded.role !== 'superadmin') {
        throw createError({ statusCode: 403, message: 'Forbidden: Only Super Admin can perform this action' })
      }
    }

    // RBAC: Only superadmin can access logs and settings
    if (cleanPath.startsWith('/api/admin/logs') || cleanPath.startsWith('/api/admin/settings')) {
      if (decoded.role !== 'superadmin') {
        throw createError({ statusCode: 403, message: 'Forbidden: Super Admin access required' })
      }
    }
  }
})
