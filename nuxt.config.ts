// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-14',
  devtools: { enabled: true },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: process.env.JWT_EXPIRY,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    public: {
      appUrl: process.env.APP_URL
    }
  },
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxtjs/google-fonts'
  ],
  googleFonts: {
    families: {
      'El Messiri': [600, 700],
      'Raleway': [400, 500, 700]
    },
    display: 'swap',
    prefetch: true,
    preconnect: true,
    preload: true
  },
  css: ['~/assets/css/tailwind.css'],
  app: {
    head: {
      title: 'Orbcomm SC1000',
      meta: [
        { name: 'description', content: 'Orbcomm SC1000 - Satelite Communication Device' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  routeRules: {
    // Admin routes bypass SSR
    '/admin/**': { ssr: false },
    // Public routes cached for performance (SWR)
    '/': { swr: 3600 },
    '/shop': { swr: 3600 },
    // Global Security Headers
    '/**': { 
      headers: { 
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      } 
    }
  }
})
