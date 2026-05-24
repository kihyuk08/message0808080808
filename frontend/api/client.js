// ========================================
// 📁 frontend/api/client.js - Axios 기본 설정 (영민 담당)
// ========================================
// Axios는 서버(백엔드)에 HTTP 요청을 보내는 라이브러리예요.
// 이 파일에서 모든 요청에 공통으로 적용할 설정을 해요.
//
// 이 파일이 하는 일:
//  1. Axios 인스턴스 생성 (기본 URL 설정)
//  2. request 인터셉터: 모든 요청에 JWT 토큰 자동 첨부
//  3. response 인터셉터: 401 에러 시 자동 로그아웃
//
// 사용법: 다른 api 파일에서 import api from './client' 로 가져다 써요

import axios from 'axios'

// axios.create(): 공통 설정이 적용된 Axios 인스턴스를 만들어요
// 마치 택배 회사를 하나 정해두는 것처럼,
// 모든 요청은 이 인스턴스를 통해 보내게 돼요
const api = axios.create({
  // baseURL: 모든 요청의 기본 주소
  // Vite의 vite.config.js에서 /api 는 localhost:5000/api 로 프록시해줘요
  // 개발 중: /api → http://localhost:5000/api
  // 환경변수를 설정했다면 VITE_API_URL 값 사용
  baseURL: import.meta.env.VITE_API_URL || '/api',

  // timeout: 10초 안에 응답이 없으면 에러로 처리
  timeout: 10000,

  // headers: 모든 요청에 JSON 형식임을 알려줘요
  headers: {
    'Content-Type': 'application/json'
  }
})

// ─────────────────────────────────────
// Request 인터셉터 (요청 보내기 전 실행)
// ─────────────────────────────────────
// 모든 API 요청이 서버로 가기 전에 이 코드가 실행돼요.
// JWT 토큰을 헤더에 자동으로 붙여줘서 로그인 상태를 서버에 알려요.
api.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기
    // 영민이 로그인 성공 후 localStorage.setItem('token', token) 으로 저장해둬요
    const token = localStorage.getItem('token')

    if (token) {
      // Authorization 헤더에 토큰 첨부
      // 형식: "Bearer eyJhbGciOiJIUzI1NiJ9..."
      // 기혁의 authMiddleware가 이 헤더에서 토큰을 꺼내서 검증해요
      config.headers.Authorization = `Bearer ${token}`
    }

    return config  // 수정된 설정으로 요청 계속 진행
  },
  (error) => {
    // 요청 자체가 잘못된 경우 (거의 발생하지 않음)
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────
// Response 인터셉터 (응답 받은 후 실행)
// ─────────────────────────────────────
// 서버에서 응답이 오면 이 코드가 실행돼요.
// 401 에러(인증 실패)가 오면 자동으로 로그아웃 처리해요.
api.interceptors.response.use(
  (response) => {
    // 정상 응답 (2xx): 그냥 통과
    return response
  },
  (error) => {
    // 에러 응답 처리
    if (error.response?.status === 401) {
      // 401 Unauthorized: 토큰이 만료됐거나 유효하지 않은 경우
      // localStorage에서 토큰 삭제 → 로그아웃 처리
      localStorage.removeItem('token')

      // 로그인 페이지로 이동 (페이지 새로고침으로 Redux 상태도 초기화)
      // window.location.href를 쓰면 React Router 없이도 이동 가능
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
