// ========================================
// 📁 frontend/store/messageSlice.js - 메시지 상태 관리 (영민 담당)
// ========================================
// 현재 채팅방의 메시지 목록을 전역 상태로 관리해요.
// 지후의 소켓 훅(useSocket.js)에서 새 메시지가 오면 이 슬라이스에 추가해요.
//
// 이 파일이 관리하는 상태:
//  messages      : 현재 채팅방의 메시지 배열
//  currentRoomId : 현재 열려있는 채팅방 ID
//  isLoading     : 메시지 불러오는 중 여부
//
// 이 파일이 제공하는 액션:
//  setMessages   : 과거 메시지 목록 설정 (React Query로 불러왔을 때)
//  addMessage    : 새 메시지 추가 (소켓으로 실시간 수신했을 때)
//  setCurrentRoom: 현재 채팅방 변경
//  clearMessages : 메시지 초기화 (채팅방 나갔을 때)

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  messages:      [],   // 메시지 배열 (빈 배열로 시작)
  currentRoomId: null, // 현재 채팅방 ID
  isLoading:     false
}

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {

    // ─────────────────────────────────────
    // setMessages: 과거 메시지 목록 전체 설정
    // ─────────────────────────────────────
    // 채팅방에 입장하면 React Query로 과거 메시지를 불러와서 여기에 저장해요
    // 사용법: dispatch(setMessages(messagesArray))
    setMessages: (state, action) => {
      state.messages  = action.payload
      state.isLoading = false
    },

    // ─────────────────────────────────────
    // addMessage: 새 메시지 추가 (실시간)
    // ─────────────────────────────────────
    // 지후의 useSocket.js에서 'receiveMessage' 소켓 이벤트를 받으면 이걸 호출해요
    // 사용법: dispatch(addMessage(newMessage))
    addMessage: (state, action) => {
      // 같은 메시지가 두 번 추가되는 걸 방지 (중복 체크)
      const exists = state.messages.some(msg => msg._id === action.payload._id)
      if (!exists) {
        state.messages.push(action.payload)  // 배열 끝에 추가 (최신 메시지)
      }
    },

    // ─────────────────────────────────────
    // setCurrentRoom: 현재 채팅방 설정
    // ─────────────────────────────────────
    // 서현의 RoomList에서 채팅방 클릭 시 호출해요
    setCurrentRoom: (state, action) => {
      state.currentRoomId = action.payload
    },

    // ─────────────────────────────────────
    // clearMessages: 메시지 초기화
    // ─────────────────────────────────────
    // 채팅방을 나가거나 다른 방으로 이동할 때 호출해요
    clearMessages: (state) => {
      state.messages      = []
      state.currentRoomId = null
    },

    // ─────────────────────────────────────
    // setLoading: 로딩 상태 설정
    // ─────────────────────────────────────
    setLoading: (state, action) => {
      state.isLoading = action.payload
    }
  }
})

export const setMessages    = messageSlice.actions.setMessages
export const addMessage     = messageSlice.actions.addMessage
export const setCurrentRoom = messageSlice.actions.setCurrentRoom
export const clearMessages  = messageSlice.actions.clearMessages
export const setLoading     = messageSlice.actions.setLoading

export default messageSlice.reducer
