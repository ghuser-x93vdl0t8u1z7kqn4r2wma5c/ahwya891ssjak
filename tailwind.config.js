/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'yatra-one': ['var(--font-yatra-one)', 'cursive'],
      },
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        'primary-light': 'var(--color-primary-light)',
        'text-heading': 'var(--color-text-heading)',
        'text-body': 'var(--color-text-body)',
        'input-text': 'var(--color-input-text)',
        'input-bg': 'var(--color-input-bg)',
        'background': 'var(--color-background)',
        'background-light': 'var(--color-background-light)',
        'accent': 'var(--color-accent)',
      },
    },
  },
  plugins: [],
} 