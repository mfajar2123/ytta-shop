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
        { name: 'description', content: 'Orbcomm SC1000 - Satelite Communication Device' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  routeRules: {
    '/admin/**': { ssr: false }
  }
})
