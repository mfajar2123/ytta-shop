import { db } from '../db'
import { adminLogs } from '../db/schema'

export async function logAdminAction(
  event: any,
  action: string,
  entity: string,
  entityId: string | null = null,
  details: { before?: any; after?: any } | null = null,
  status: 'SUCCESS' | 'FAILED' = 'SUCCESS',
  adminIdOverride?: string | null
) {
  // Extract info from event if available
  let adminId = adminIdOverride || null
  let ipAddress = 'unknown'
  let userAgent = 'unknown'

  if (event) {
    if (!adminId && event.context?.user?.sub) {
      adminId = event.context.user.sub
    }
    
    // Attempt to extract IP (accounting for proxies/Nuxt behavior)
    const req = event.node?.req
    if (req) {
      ipAddress = 
        req.headers['x-forwarded-for']?.toString().split(',')[0] || 
        req.socket?.remoteAddress || 
        'unknown'
      
      userAgent = req.headers['user-agent'] || 'unknown'
    }
  }

  const logData = {
    adminId,
    action,
    entity,
    entityId,
    details,
    ipAddress,
    userAgent,
    status
  }

  // Fire and forget using waitUntil (if nitro supports it directly or just floating promise)
  // We use a floating promise so we don't block the main request handler
  const logPromise = db.insert(adminLogs).values(logData).catch((err) => {
    console.error('CRITICAL: Failed to write to admin_logs table:', err)
  })

  // If using Nitro's experimental context or Cloudflare, you'd use event.waitUntil
  // For standard Node environment in Nuxt, we just let the promise resolve asynchronously.
  if (event?.waitUntil) {
    event.waitUntil(logPromise)
  }
}
