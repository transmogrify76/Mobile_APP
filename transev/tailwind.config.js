/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all your component and page files
  ],
  theme: {
    extend: {colors: {
      blue: {
        500: '#3B82F6',
        600: '#2563EB',
      },
      green: {
        500: '#10B981',
        600: '#059669',
      },
      gray: {
        200: '#E5E7EB',
        500: '#6B7280',
        600: '#4B5563',
      },
    },
  },
   transitionProperty: {
    'width': 'width',
    'spacing': 'margin, padding',
  },
  },
  plugins: [],
};
