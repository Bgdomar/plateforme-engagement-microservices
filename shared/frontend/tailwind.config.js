/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E9F1FA',
          100: '#D5ECF7',
          200: '#A9DFF1',
          300: '#76CEEA',
          400: '#3EBDE3',
          500: '#00ABE4',
          600: '#0089B8',
          700: '#00668C',
          800: '#004460',
          900: '#002234',
          950: '#001523',
        },
        brand: {
          dark: '#1E3A5F',
          light: '#E9F1FA',
          gray: '#6B7280',
          white: '#FFFFFF',
        },
        slate: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backdropBlur: {
        'sm': '4px',
        'md': '10px',
        'lg': '20px',
        'xl': '40px',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'md': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'lg': '0 20px 50px rgba(0, 0, 0, 0.15)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        in: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        slideDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}

