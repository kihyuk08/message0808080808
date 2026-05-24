// ========================================
// 📁 frontend/store/authSlice.js - 로그인 상태 관리 (영민 담당)
// ========================================
// Redux Toolkit의 createSlice로 로그인 관련 전역 상태를 관리해요.
//
// Redux란? 앱 전체에서 공유하는 데이터를 한 곳에서 관리하는 것이에요.
// 예) 로그인한 사용자 정보를 LoginPage에서 저장하면
//     ChatPage, FriendsPage 어디서든 꺼내 쓸 수 있어요.
//
// 이 파일이 관리하는 상태:
//  user      : 로그인한 사용자 정보 { id, name, email, ... }
//  token     : JWT 토큰 문자열
//  isLoggedIn: 로그인 여부 (true/false)
//
// 이 파일이 제공하는 액션:
//  setUser   : 로그인 성공 시 사용자 정보와 토큰 저장
//  updateUser: 프로필 수정 후 사용자 정보 업데이트
//  logoutUser: 로그아웃 (상태 초기화)

import { createSlice } from '@reduxjs/toolkit'

// 초기 상태: 앱이 시작할 때의 기본값
// localStorage에서 토큰을 읽어서 자동 로그인 상태를 설정해요
const savedToken = localStorage.getItem('token')

const initialState = {
  user:       null,            // 사용자 정보 없음 (나중에 API로 가져옴)
  token:      savedToken,      // 저장된 토큰 (없으면 null)
  isLoggedIn: !!savedToken     // 토큰이 있으면 true (!! = boolean 변환)
  // !!null   = false (로그아웃 상태)
  // !!"eyJ..." = true (로그인 상태)
}

// createSlice(): Redux 상태(state), 액션(actions), 리듀서(reducers)를 한 번에 정의
const authSlice = createSlice({
  name: 'auth',  // 슬라이스 이름 (Redux DevTools에서 확인할 때 사용)

  initialState,

  reducers: {
    // ─────────────────────────────────────
    // setUser: 로그인 성공 시 호출
    // ─────────────────────────────────────
    // 사용법: dispatch(setUser({ user, token }))
    // LoginPage에서 로그인 API 응답을 받으면 이걸 호출해요
    setUser: (state, action) => {
      // action.payload = dispatch 호출 시 넘겨준 데이터
      state.user       = action.payload.user
      state.token      = action.payload.token
      state.isLoggedIn = !!(action.payload.user && action.payload.token)
    },

    // ─────────────────────────────────────
    // updateUser: 프로필 수정 후 사용자 정보 업데이트
    // ─────────────────────────────────────
    // 사용법: dispatch(updateUser({ name: '새이름', statusMessage: '새상태' }))
    updateUser: (state, action) => {
      // 기존 user 정보에 변경된 부분만 덮어쓰기
      // { ...state.user, ...action.payload }: 스프레드 연산자로 합치기
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },

    // ─────────────────────────────────────
    // logoutUser: 로그아웃
    // ─────────────────────────────────────
    // 사용법: dispatch(logoutUser())
    // localStorage에서 토큰을 지우는 건 컴포넌트에서 직접 해요
    logoutUser: (state) => {
      state.user       = null
      state.token      = null
      state.isLoggedIn = false
    }
  }
})

// 액션 생성자 내보내기 (컴포넌트에서 dispatch(setUser(...)) 식으로 사용)
export const { setUser, updateUser, logoutUser } = authSlice.actions

// 리듀서 내보내기 (store/index.js에서 combine할 때 사용)
export default authSlice.reducer
