import defaultTheme from 'tailwindcss/defaultConfig';

export default {
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#FAF7F4',
          card: '#FFF',
          text: '#222',
          secondary: '#595959',
          border: '#D9D9D9',
          accent: '#F56400',
        }
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.theme.fontFamily.sans],
      }
    }
  }
};
