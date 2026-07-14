import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          white: '#FFFFFF',
          offwhite: '#F5F5F7',
          black: '#1D1D1F',
          gray: '#6E6E73',
          lightgray: '#D2D2D7',
          blue: '#0071E3',
          bluehover: '#0077ED'
        },
        brand: {
          blue: {
            DEFAULT: '#1c345a',
            dark: '#13233c',
            light: '#2a4c84',
            accent: '#3e6fba'
          },
          orange: {
            DEFAULT: '#f5a623',
            dark: '#db9117',
            light: '#f7b94d'
          }
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"San Francisco"',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'sans-serif'
        ],
        heading: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"San Francisco"',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
