/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        'accent-yellow': '#FDE68A',
        'accent-pink': '#FBCFE8',
        'accent-mint': '#A7F3D0',
        'accent-lavender': '#DDD6FE',
        'accent-peach': '#FED7AA',
        'accent-sky': '#BAE6FD',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
      },
      fontFamily: {
        sans: [
          'Inter var',
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        display: ['Cal Sans', 'Inter var', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-lg': ['4.5rem', { lineHeight: '1', fontWeight: '700' }],
        'display-md': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.04)',
        medium: '0 4px 16px rgba(0, 0, 0, 0.08)',
        strong: '0 8px 32px rgba(0, 0, 0, 0.12)',
        glow: '0 0 24px rgba(253, 230, 138, 0.5)',
        'glow-pink': '0 0 24px rgba(251, 207, 232, 0.5)',
        'glow-mint': '0 0 24px rgba(167, 243, 208, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        shake: 'shake 0.5s ease-in-out',
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(253, 230, 138, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(253, 230, 138, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
