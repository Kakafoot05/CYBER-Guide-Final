/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        brand: {
          navy: '#0B1F3B', // Deep Navy (Primary Background)
          steel: '#2F5EA6', // Steel Blue (Primary Action)
          light: '#7FA6D6', // Light Blue (Secondary Text)
          pale: '#E6EEF8', // Very Light Blue (Panel Backgrounds)
          gold: '#C6A15B', // Gold (Premium Accent)
          white: '#FFFFFF',
          alert: '#EF4444',
          success: '#10B981',
        },
      },
      backgroundImage: {
        'tech-grid':
          "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232F5EA6' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
        'shield-lines':
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 15 L30 30 L0 15 Z' fill='none' stroke='%232F5EA6' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E\")",
        'ops-ambient':
          'radial-gradient(circle at 18% -5%, rgba(47,94,166,0.22), transparent 46%), radial-gradient(circle at 88% 8%, rgba(198,161,91,0.16), transparent 34%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
      },
      boxShadow: {
        panel: '0 1px 3px 0 rgba(11, 31, 59, 0.1), 0 1px 2px 0 rgba(11, 31, 59, 0.06)',
        'panel-hover':
          '0 4px 6px -1px rgba(11, 31, 59, 0.1), 0 2px 4px -1px rgba(11, 31, 59, 0.06)',
        glow: '0 0 15px rgba(47, 94, 166, 0.15)',
        'ambient-xl': '0 24px 40px -28px rgba(11,31,59,0.45)',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};
