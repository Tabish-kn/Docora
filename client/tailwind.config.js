/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        docora: {
          primary: '#7657E8',
          'primary-hover': '#6544D7',
          'primary-light': '#F0EDFF',
          bg: '#F8F7FF',
          'dark-bg': '#11101B',
          card: '#FFFFFF',
          'dark-card': '#191728',
          'dark-card-hover': '#232038',
          'text-primary': '#242039',
          'text-secondary': '#77738B',
          'dark-text': '#F1EFFF',
          'dark-muted': '#A39EBC',
          success: '#159B77',
          accent: '#F1A34A',
          border: '#EAE8F0',
          'dark-border': '#282440',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'premium': '0 4px 20px -2px rgba(118, 87, 232, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'floating': '0 12px 36px -4px rgba(17, 16, 27, 0.12), 0 4px 12px -2px rgba(17, 16, 27, 0.06)',
      }
    },
  },
  plugins: [],
}
