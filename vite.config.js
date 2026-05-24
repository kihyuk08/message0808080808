// ========================================
// 📁 vite.config.js - Vite 개발/빌드 설정
// ========================================
// Vite는 React 프론트엔드를 빠르게 실행하고 빌드해주는 도구예요.
// 개발 중: npm run dev → localhost:5173 에서 실행
// 배포 시: npm run build → dist/ 폴더에 정적 파일 생성
//
// 담당: 영민

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // frontend/ 폴더를 소스 루트로 설정
  root: 'frontend',

  // React JSX를 브라우저용 JS로 변환
  plugins: [react()],

  // ─────────────────────────────────────
  // base: GitHub Pages 배포 시 경로 설정
  // ─────────────────────────────────────
  // GitHub Pages URL이 https://아이디.github.io/레포이름/ 이라면
  // base: '/레포이름/' 으로 설정해야 해요.
  //
  // ⚠️ 아래 '/messenger/' 부분을 실제 GitHub 레포지토리 이름으로 바꾸세요!
  // 예) 레포 이름이 'my-chat-app' 이라면 → base: '/my-chat-app/'
  //
  // 만약 도메인이 https://아이디.github.io (레포 이름 없음) 라면
  // base: '/' 로 설정해도 돼요.
  base: process.env.NODE_ENV === 'production' ? '/message0808080808/' : '/',

  server: {
    port: 5173,

    // 개발 중에만 프록시 사용 (배포 시엔 .env.production의 VITE_API_URL 사용)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  },

  build: {
    // 빌드 결과물 저장 위치 (프로젝트 루트의 dist/ 폴더)
    outDir: '../dist',
    emptyOutDir: true
  }
})
