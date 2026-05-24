// ========================================
// 📁 frontend/api/authApi.js - 로그인·회원가입 API 함수 (영민 담당)
// ========================================
// 로그인, 회원가입, 내 정보 조회를 처리하는 함수들이에요.
// 예지가 만든 LoginPage에서 이 함수들을 호출해요.
//
// 이 파일의 함수들:
//  login(email, password)           → 로그인
//  register(name, email, password)  → 회원가입
//  getMyInfo()                       → 내 정보 조회 (자동 로그인 확인용)

import api from './client'  // Axios 인스턴스 (토큰 자동 첨부됨)

// ─────────────────────────────────────
// 로그인
// ─────────────────────────────────────
// 성공 시 { token, user } 반환
// LoginPage에서: const { token, user } = await login(email, password)
export const login = async (email, password) => {
  // api.post('/auth/login'): POST /api/auth/login 요청
  // (baseURL이 '/api' 라서 '/auth/login' 만 써도 돼요)
  const response = await api.post('/auth/login', { email, password })

  // 응답에서 토큰 추출해서 localStorage에 저장
  // 이 토큰이 있어야 로그인 상태가 유지돼요
  const { token, user } = response.data
  localStorage.setItem('token', token)

  return { token, user }
}

// ─────────────────────────────────────
// 회원가입
// ─────────────────────────────────────
// 성공 시 { user } 반환 (토큰은 발급 안 함, 바로 로그인 필요)
export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password })
  return response.data
}

// ─────────────────────────────────────
// 내 정보 조회
// ─────────────────────────────────────
// 앱 시작 시 localStorage의 토큰으로 내 정보를 가져와요
// 토큰이 유효하면 자동 로그인 처리할 때 사용해요
export const getMyInfo = async () => {
  const response = await api.get('/auth/me')
  return response.data.user
}

// ─────────────────────────────────────
// 로그아웃 (서버에 요청 없이 클라이언트에서 처리)
// ─────────────────────────────────────
export const logout = () => {
  // localStorage에서 토큰 삭제
  localStorage.removeItem('token')
  // 페이지 새로고침으로 Redux 상태 초기화
  window.location.href = '/login'
}
