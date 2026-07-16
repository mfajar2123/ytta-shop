export default defineEventHandler((event) => {
  setCookie(event, 'admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0 // Expire immediately
  })
  
  return { message: 'Logged out successfully' }
})
