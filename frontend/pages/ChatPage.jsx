// ========================================
// 📁 frontend/pages/ChatPage.jsx - 채팅 메인 페이지 (예지 담당)
// ========================================
// 앱의 메인 화면이에요. 좌측 사이드바와 우측 채팅창으로 구성돼요.
//
// 레이아웃 구조:
//  ┌──────────────┬─────────────────────────────────┐
//  │   Sidebar    │        ChatWindow               │
//  │  (240px)     │       (나머지 공간)              │
//  │  채팅방 목록   │  메시지 목록 + 입력창            │
//  └──────────────┴─────────────────────────────────┘
//
// 이 컴포넌트는 레이아웃(틀)만 담당해요.
// 실제 채팅방 목록 → 서현의 RoomList
// 실제 메시지 → 예지의 ChatWindow, 지후의 useSocket

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Sidebar    from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import { setCurrentRoom } from '../store/messageSlice'

function ChatPage() {
  const dispatch = useDispatch()

  // 현재 선택된 채팅방 상태
  // null: 아무 채팅방도 선택 안 됨
  // room 객체: 선택된 채팅방 정보
  const [selectedRoom, setSelectedRoom] = useState(null)

  // 채팅방 선택 핸들러 (Sidebar → ChatWindow로 데이터 전달)
  const handleSelectRoom = (room) => {
    setSelectedRoom(room)
    // Redux에도 현재 채팅방 ID 저장 (알림 등에서 활용)
    dispatch(setCurrentRoom(room._id))
  }

  return (
    // 전체 화면을 채우는 flex 컨테이너
    // h-screen: 뷰포트 전체 높이
    // overflow-hidden: 자식 스크롤이 밖으로 나가지 않게
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* 좌측 사이드바 (예지의 레이아웃 + 서현의 RoomList) */}
      <Sidebar
        onSelectRoom={handleSelectRoom}
        selectedRoomId={selectedRoom?._id}
      />

      {/* 우측 채팅 영역 */}
      {/* flex-1: 남은 공간을 모두 차지 */}
      <div className="flex-1 overflow-hidden">
        {selectedRoom ? (
          // 채팅방 선택됐으면 ChatWindow 표시
          <ChatWindow
            roomId={selectedRoom._id}
            room={selectedRoom}
          />
        ) : (
          // 선택 안 됐으면 안내 메시지 표시
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
            <span className="text-5xl">💬</span>
            <p className="text-base font-medium text-gray-500">채팅방을 선택해주세요</p>
            <p className="text-sm">왼쪽 목록에서 채팅방을 클릭하거나</p>
            <p className="text-sm">친구 탭에서 새 대화를 시작하세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage
