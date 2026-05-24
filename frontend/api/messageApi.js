// ========================================
// 📁 frontend/api/messageApi.js - 메시지 API 함수 (영민 담당)
// ========================================
// 채팅 메시지를 불러오고 저장하는 API 함수들이에요.
// useMessages.js (React Query 훅)에서 이 함수들을 사용해요.
//
// 이 파일의 함수들:
//  getMessages(roomId)              → 특정 채팅방의 과거 메시지 목록 조회
//  sendMessage(content, roomId)     → 새 메시지 저장 (REST API 방식)
//
// ✅ 과거 메시지: REST API (이 파일)로 처리
// ✅ 실시간 새 메시지: Socket.IO (useSocket.js)로 처리
// 이 두 가지를 함께 사용해요!

import api from './client'

// ─────────────────────────────────────
// 메시지 목록 조회
// ─────────────────────────────────────
// roomId: 조회할 채팅방의 ID
// page: 페이지 번호 (1부터 시작, 기본 1페이지)
export const getMessages = async (roomId, page = 1) => {
  const response = await api.get(`/messages/${roomId}`, {
    params: { page, limit: 50 }  // 한 번에 50개씩
  })
  return response.data.messages
}

// ─────────────────────────────────────
// 메시지 전송 (DB 저장용)
// ─────────────────────────────────────
// 실시간 전송은 Socket.IO로 하지만, DB 저장은 REST API로도 할 수 있어요
// Socket.IO의 sendMessage 이벤트 핸들러에서 DB 저장을 이미 처리하기 때문에
// 이 함수는 필요할 때만 사용해요
export const sendMessage = async (content, roomId) => {
  const response = await api.post('/messages', { content, roomId })
  return response.data.message
}
