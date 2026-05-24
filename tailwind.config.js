/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfaf5',
          100: '#faf3e8',
          200: '#f5e6d0',
          300: '#edd4b0',
        },
        ink: '#1a1614',
        coral: '#e8573a',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        gaegu: ['Gaegu', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out both',
        'slide-up': 'slideUp 0.8s ease-out both',
        'bounce-in': 'bounceIn 0.8s ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.7) translateY(-16px)' },
          '60%': { opacity: '1', transform: 'scale(1.08) translateY(0)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
