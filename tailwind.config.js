/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coal: '#0a0e14',
        panel: {
          DEFAULT: '#121824',
          elevated: '#182232',
        },
        bezel: '#283446',
        text: {
          bright: '#f1f5f9',
          dim: '#94a3b8',
        },
        cyan: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b111a',
        },
        mine: {
          950: '#0a0e14',
          900: '#121824',
          850: '#182232',
          800: '#202b3c',
          700: '#283446',
          600: '#38465c',
          500: '#4b5d78',
          400: '#778da9',
          300: '#a3b8cc',
        },
        holo: {
          DEFAULT: '#64748b',
          glow: 'transparent',
          dim: '#475569',
          dark: '#1e293b',
        },
        safety: {
          green: '#2D8A61',
          'green-glow': 'transparent',
          amber: '#B47A18',
          'amber-glow': 'transparent',
          red: '#A83D45',
          'red-glow': 'transparent',
          blue: '#536B7D',
        },
        ivory: {
          DEFAULT: '#F5F4EF',
          warm: '#ECEBE6',
          surface: '#FFFFFF',
          dark: '#E2E0D8',
          border: '#DCDAD4',
        },
        forest: {
          DEFAULT: '#176B4D',
          hover: '#13563D',
          light: '#2D8A61',
          soft: '#EAF3EF',
        },
        charcoal: {
          DEFAULT: '#151713',
          muted: '#666861',
          subtle: '#8C8E87',
          border: '#DCDAD4',
          dark: '#171A17',
        },
      },
      fontFamily: {
        serif: ['"Newsreader"', 'Georgia', 'serif'],
        display: ['"Chakra Petch"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'scanline': 'scanline 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'beacon': 'beacon 1.5s ease-out infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        beacon: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
