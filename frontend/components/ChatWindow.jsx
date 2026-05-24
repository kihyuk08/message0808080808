// ========================================
// 📁 frontend/components/ChatWindow.jsx - 채팅 메시지 영역 (예지 담당)
// ========================================
// 메시지 목록을 보여주고 실시간으로 업데이트하는 컴포넌트예요.
// MessageBubble(말풍선)과 MessageInput(입력창)을 조합해요.
//
// 이 컴포넌트가 하는 일:
//  1. 과거 메시지 로드 (React Query - 영민 담당)
//  2. 실시간 메시지 수신 (Socket.IO - 지후 담당)
//  3. 새 메시지가 오면 자동으로 맨 아래로 스크롤
//  4. 메시지 전송 처리
//
// Props:
//  roomId : 현재 채팅방 ID
//  room   : 채팅방 정보 (참여자 목록 등)

import { useEffect, useRef } from 'react'
import { useSelector }       from 'react-redux'
import MessageBubble from './MessageBubble'
import MessageInput  from './MessageInput'
import UserAvatar    from './UserAvatar'
import useMessages   from '../hooks/useMessages'
import useSocket     from '../hooks/useSocket'

function ChatWindow({ roomId, room }) {
  // 메시지 목록 맨 아래를 가리키는 참조 (자동 스크롤용)
  const bottomRef = useRef(null)

  // Redux에서 로그인한 사용자 정보 가져오기
  const currentUser = useSelector((state) => state.auth.user)

  // Redux에서 메시지 목록 가져오기 (소켓으로 실시간 업데이트됨)
  const messages = useSelector((state) => state.message.messages)

  // 영민의 React Query 훅: 과거 메시지 불러오기
  const { isLoading } = useMessages(roomId)

  // 지후의 소켓 훅: 실시간 메시지 수신 + 전송 기능
  const { sendMessage, markAsRead } = useSocket(roomId)

  // 채팅방에 입장하거나 메시지가 추가되면 자동으로 맨 아래 스크롤
  useEffect(() => {
    // scrollIntoView(): 해당 요소가 화면에 보이도록 스크롤
    // behavior: 'smooth' = 부드럽게 스크롤
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 채팅창에 들어오면 읽지 않은 메시지 읽음 처리
  useEffect(() => {
    if (roomId) {
      markAsRead()
    }
  }, [roomId, markAsRead])

  // 채팅 상대방 정보 추출 (참여자 중 나를 제외한 상대방)
  const partner = room?.participants?.find(p => p._id !== currentUser?.id)

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* 상단 헤더: 채팅 상대방 정보 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <UserAvatar
          name={partner?.name || '채팅방'}
          imageUrl={partner?.profileImage}
          size="md"
          isOnline={partner?.isOnline}
        />
        <div>
          <div className="font-medium text-gray-900 text-sm">
            {partner?.name || '채팅방'}
          </div>
          <div className="text-xs text-gray-400">
            {partner?.isOnline ? '온라인' : '오프라인'}
          </div>
        </div>
      </div>

      {/* 메시지 목록 영역 (스크롤 가능) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 chat-messages">

        {/* 로딩 중 표시 */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="text-sm text-gray-400">메시지를 불러오는 중...</div>
          </div>
        )}

        {/* 메시지가 없을 때 */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <span className="text-4xl">💬</span>
            <p className="text-sm">첫 메시지를 보내보세요!</p>
          </div>
        )}

        {/* 메시지 목록 */}
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            // 내가 보낸 메시지인지 확인
            isMine={message.sender?._id === currentUser?.id}
          />
        ))}

        {/* 스크롤 맨 아래 기준점 (여기로 자동 스크롤됨) */}
        <div ref={bottomRef} />
      </div>

      {/* 메시지 입력창 (예지의 MessageInput 컴포넌트) */}
      <MessageInput
        onSend={sendMessage}  // 지후의 sendMessage 함수 전달
        disabled={!roomId}
      />
    </div>
  )
}

export default ChatWindow
