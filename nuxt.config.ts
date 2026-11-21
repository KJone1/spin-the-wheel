export default defineNuxtConfig({
  compatibilityDate: '2026-11-20',
  devtools: { enabled: false },
  modules: [
    'reka-ui/nuxt',
    '@nuxt/eslint'
  ],
  css: ['~/assets/css/theme.css'],
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: false,
      nodeCompat: true
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'WHEEL DECIDES DESTINY',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700;800&display=swap'
        }
      ]
    }
  }
})
