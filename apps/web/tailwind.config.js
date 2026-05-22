/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // MemoryLane brand colors
        primary: {
          900: '#0f0f1e',
          800: '#1a1a2e',
          700: '#25254a',
          600: '#303368',
          500: '#4a4a8a',
          400: '#6c6c9e',
          300: '#8e8ebe',
          200: '#b0b0d0',
          100: '#d0d0e8',
          50: '#eeeef5',
        },
        accent: {
          DEFAULT: '#e94560',
          light: '#f06e85',
          dark: '#c73550',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#e6c84e',
          dark: '#b8941f',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#f8f8fc',
          muted: '#f0f0f5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(233, 69, 96, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(233, 69, 96, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
