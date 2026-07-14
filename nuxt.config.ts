// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-14',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
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
  }
})
