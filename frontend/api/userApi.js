// ========================================
// 📁 frontend/api/userApi.js - 사용자·친구·채팅방 API 함수 (영민 담당)
// ========================================
// 사용자 검색, 친구 추가, 채팅방 관련 API 함수들이에요.
// 서현이 만드는 SearchUser, RoomList, FriendsPage에서 이 함수들을 import해서 써요.
//
// ⚠️ 서현은 이 파일을 직접 수정하면 안 돼요! import만 해서 쓰면 돼요.
//    예: import { searchUsers, addFriend } from '../api/userApi'
//
// 이 파일의 함수들:
//  searchUsers(query)         → 이름/이메일로 사용자 검색
//  getFriends()               → 내 친구 목록
//  addFriend(userId)          → 친구 추가
//  getRooms()                 → 내 채팅방 목록
//  createRoom(participantId)  → 채팅방 생성

import api from './client'

// ─────────────────────────────────────
// 사용자 검색
// ─────────────────────────────────────
// query: 검색어 (이름 또는 이메일)
// 서현의 SearchUser 컴포넌트에서 300ms debounce 후 호출해요
export const searchUsers = async (query) => {
  const response = await api.get('/users/search', {
    params: { q: query }  // GET /api/users/search?q=검색어
  })
  return response.data.users
}

// ─────────────────────────────────────
// 내 친구 목록 조회
// ─────────────────────────────────────
export const getFriends = async () => {
  const response = await api.get('/users/friends')
  return response.data.friends
}

// ─────────────────────────────────────
// 친구 추가
// ─────────────────────────────────────
// userId: 친구로 추가할 사용자의 ID
export const addFriend = async (userId) => {
  const response = await api.post(`/users/friends/${userId}`)
  return response.data
}

// ─────────────────────────────────────
// 내 채팅방 목록 조회
// ─────────────────────────────────────
// 서현의 RoomList 컴포넌트에서 사용
export const getRooms = async () => {
  const response = await api.get('/users/rooms')
  return response.data.rooms
}

// ─────────────────────────────────────
// 채팅방 생성 또는 기존 방 반환
// ─────────────────────────────────────
// participantId: 대화 상대방의 ID
// 이미 이 두 사람의 채팅방이 있으면 기존 방을 반환해요
export const createRoom = async (participantId) => {
  const response = await api.post('/users/rooms', { participantId })
  return response.data.room
}
