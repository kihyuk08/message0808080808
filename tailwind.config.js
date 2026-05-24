// ========================================
// 📁 tailwind.config.js - Tailwind CSS 설정
// ========================================
// Tailwind CSS는 className에 바로 스타일을 적용하는 CSS 라이브러리예요.
// 예: <div className="flex gap-4 bg-purple-600 text-white rounded-xl">
//
// 담당: 예지 (UI 디자인)

/** @type {import('tailwindcss').Config} */
export default {
  // content: Tailwind가 어떤 파일에서 클래스 이름을 찾을지 설정
  // 이 경로를 설정하지 않으면 스타일이 전혀 적용되지 않아요!
  content: [
    "./frontend/**/*.{js,jsx,ts,tsx}",  // frontend/ 폴더 안의 모든 JS/JSX 파일
    "./frontend/index.html"             // HTML 파일도 포함
  ],

  theme: {
    extend: {
      // 팀 프로젝트 전용 색상 (팀원 모두 이 색상을 통일해서 써요)
      colors: {
        primary: {
          50:  '#EEEDFE',   // 가장 밝은 보라색 (배경용)
          100: '#DDD9FD',
          200: '#BDB5FB',
          400: '#8F84E8',
          500: '#7F77DD',   // 기본 강조색
          600: '#534AB7',   // 버튼, 링크 등 주요 UI
          700: '#3C3489',   // 호버 상태
        },
        // 각 팀원별 색상 (배지, 아바타에 사용)
        member: {
          kihyeok: '#534AB7',  // 기혁 - 보라
          jihu:    '#1D9E75',  // 지후 - 초록
          yeji:    '#185FA5',  // 예지 - 파랑
          youngmin:'#D85A30',  // 영민 - 주황
          seohyeon:'#993556',  // 서현 - 핑크
        }
      },
      // 폰트 설정
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Noto Sans KR', 'sans-serif'],
      },
      // 채팅창 높이 (화면 전체 - 헤더 높이)
      height: {
        'chat': 'calc(100vh - 64px)',
      }
    },
  },
  plugins: [],
}
