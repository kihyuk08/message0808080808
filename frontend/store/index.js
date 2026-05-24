// ========================================
// 📁 frontend/store/index.js - Redux Store 설정 (영민 담당)
// ========================================
// 앱 전체의 전역 상태를 관리하는 Redux store를 만들어요.
// authSlice와 messageSlice를 하나의 store로 합쳐요.
//
// Redux store 구조:
//  store.auth.user       → 로그인한 사용자 정보
//  store.auth.isLoggedIn → 로그인 여부
//  store.message.messages      → 현재 채팅방 메시지
//  store.message.currentRoomId → 현재 채팅방 ID
//
// App.js에서 <Provider store={store}>로 앱 전체에 제공해요

import { configureStore } from '@reduxjs/toolkit'
import authReducer    from './authSlice'
import messageReducer from './messageSlice'

// configureStore(): Redux store 생성
const store = configureStore({
  reducer: {
    // 각 슬라이스의 리듀서를 이름과 함께 등록
    // auth: authSlice에서 관리 (state.auth.xxx로 접근)
    auth:    authReducer,
    // message: messageSlice에서 관리 (state.message.xxx로 접근)
    message: messageReducer
  }
})

// ✅ 초기 상태는 authSlice.js의 initialState에서 localStorage를 읽어서 설정해요.
//    여기서 따로 dispatch할 필요가 없어요.
//    앱 시작 시 사용자 상세 정보가 없으면 App.js에서 getMyInfo() API로 가져와요.

export default store
