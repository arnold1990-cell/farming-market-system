export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        farm: {
          green: '#149943',
          light: '#93ca3a',
          blue: '#35a5da',
          mint: '#eef8eb',
          cream: '#f7f3e8',
          charcoal: '#1f2937',
          gray: '#f3f4f6'
        }
      },
      boxShadow: {
        soft: '0 8px 24px rgba(17,24,39,0.08)'
      },
      borderRadius: {
        xl2: '1rem'
      }
    }
  },
  plugins: []
};
