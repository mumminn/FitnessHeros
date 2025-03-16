/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'Arial', 'sans-serif'], // Pretendard 추가
        'press-start': ['"Press Start 2P"', 'cursive'], // 구글 폰트 등록
      },
    },
  },
  plugins: [],
}

