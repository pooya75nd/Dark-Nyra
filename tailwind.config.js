/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nyra: {
          bg: '#07080e',
          panel: '#0b0e1a',
          card: '#0f1224',
          text: '#e6e6ff',
          sub: '#a6a6d9',
          neon: '#8a5cff',
          cyan: '#39d0ff',
          acid: '#d9ff00'
        }
      },
      boxShadow: {
        'nyra-glow': '0 0 30px rgba(138,92,255,0.25), 0 0 60px rgba(57,208,255,0.15)',
        'nyra-inner': 'inset 0 0 40px rgba(138,92,255,0.12)'
      },
      borderRadius: { nyra: '1.25rem' },
      backgroundImage: {
        'nyra-hero': 'radial-gradient(1000px 500px at 20% -10%, rgba(138,92,255,0.25), transparent), radial-gradient(800px 500px at 90% 0%, rgba(57,208,255,0.25), transparent)',
        'nyra-grad': 'linear-gradient(135deg, rgba(138,92,255,0.15), rgba(57,208,255,0.10))'
      }
    }
  },
  plugins: [],
}
