// ========================================
// 📁 frontend/components/MessageBubble.jsx - 메시지 말풍선 (예지 담당)
// ========================================
// 채팅 메시지를 말풍선 형태로 보여주는 컴포넌트예요.
// 내 메시지는 오른쪽(보라색), 상대 메시지는 왼쪽(회색)으로 표시해요.
//
// Props:
//  message  : 메시지 객체 { content, sender: { name, profileImage }, createdAt, isRead }
//  isMine   : boolean - true면 내 메시지, false면 상대 메시지
//
// 사용 예시 (ChatWindow에서):
//  <MessageBubble message={msg} isMine={msg.sender._id === currentUser.id} />

import UserAvatar from './UserAvatar'

// 시간 포맷팅 함수: "오후 3:25" 형태로 변환
function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('ko-KR', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true   // 오전/오후 표시
  })
}

// ─────────────────────────────────────
// MessageBubble 컴포넌트
// ─────────────────────────────────────
function MessageBubble({ message, isMine }) {
  const { content, sender, createdAt, isRead } = message

  return (
    // 전체 행: isMine에 따라 오른쪽/왼쪽 정렬
    // justify-end: 오른쪽 정렬 (내 메시지)
    // justify-start: 왼쪽 정렬 (상대 메시지)
    <div className={`flex gap-2 mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}>

      {/* 상대방 메시지일 때만 프로필 아바타 표시 (내 메시지엔 안 보임) */}
      {!isMine && (
        <UserAvatar
          name={sender?.name || '?'}
          imageUrl={sender?.profileImage}
          size="sm"
          className="flex-shrink-0 mt-1"  // 아바타가 위로 이동하지 않게 고정
        />
      )}

      {/* 메시지 내용 영역 */}
      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>

        {/* 보낸 사람 이름 (상대방 메시지일 때만 표시) */}
        {!isMine && (
          <span className="text-xs text-gray-500 mb-1 ml-1">
            {sender?.name || '알 수 없음'}
          </span>
        )}

        {/* 말풍선 + 시간 + 읽음 표시 */}
        <div className={`flex items-end gap-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>

          {/* 실제 말풍선 */}
          <div
            className={`
              px-4 py-2.5               // 안쪽 여백
              rounded-2xl               // 둥근 모서리
              text-sm leading-relaxed  // 글자 크기, 줄 높이
              break-words               // 긴 단어도 줄바꿈
              ${isMine
                ? 'bg-purple-600 text-white rounded-br-sm'    // 내 메시지: 보라색, 오른쪽 아래 모서리 작게
                : 'bg-white text-gray-900 rounded-bl-sm shadow-sm' // 상대: 흰색, 왼쪽 아래 모서리 작게
              }
            `}
          >
            {content}
          </div>

          {/* 시간 + 읽음 표시 */}
          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
            {/* 보낸 시간 */}
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatTime(createdAt)}
            </span>

            {/* 읽음 표시 (내 메시지에만) */}
            {isMine && (
              <span className={`text-xs ${isRead ? 'text-blue-400' : 'text-gray-300'}`}>
                {isRead ? '읽음' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
