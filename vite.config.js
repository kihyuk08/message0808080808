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
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// ES Module 환경에서 __dirname을 직접 쓸 수 없어서 이렇게 만들어요
// __dirname = 이 파일(vite.config.js)이 있는 폴더의 절대 경로
const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

export default defineConfig({
  // frontend/ 폴더를 소스 루트로 설정 (절대 경로로 지정해서 어디서 실행해도 동일)
  root: resolve(__dirname, 'frontend'),

  // React JSX를 브라우저용 JS로 변환
  plugins: [react()],

  // ─────────────────────────────────────
  // base: GitHub Pages 배포 시 경로 설정
  // ─────────────────────────────────────
  // GitHub Pages URL: https://kihyuk08.github.io/message0808080808/
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
    // 빌드 결과물 저장 위치 (절대 경로로 지정 → 프로젝트 루트의 dist/ 폴더)
    outDir:     resolve(__dirname, 'dist'),
    emptyOutDir: true
  }
})
