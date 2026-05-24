// ========================================
// 📁 frontend/components/RoomList.jsx - 채팅방 목록 (서현 담당)
// ========================================
// 내가 참여한 채팅방 목록을 보여주는 컴포넌트예요.
// 예지의 Sidebar 안에 들어가요.
//
// 이 컴포넌트가 하는 일:
//  1. 내 채팅방 목록 조회 (영민의 userApi.getRooms() 사용)
//  2. 각 방마다 상대방 이름, 마지막 메시지, 시간 표시
//  3. 채팅방 클릭 시 해당 방으로 이동
//
// Props:
//  onSelectRoom: 채팅방 클릭 시 호출할 함수 (부모 컴포넌트에서 받아요)
//  selectedRoomId: 현재 선택된 채팅방 ID

import { useQuery }    from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { getRooms }    from '../api/userApi'   // 영민이 만든 API 함수 사용
import UserAvatar      from './UserAvatar'

// 시간 표시 함수: 오늘이면 시간만, 아니면 날짜 표시
function formatLastTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now  = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    // 오늘: "오후 3:25"
    return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true })
  }
  // 다른 날: "12/25"
  return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
}

function RoomList({ onSelectRoom, selectedRoomId }) {
  // Redux에서 현재 로그인한 사용자 정보 가져오기
  const currentUser = useSelector((state) => state.auth.user)

  // React Query: 채팅방 목록 불러오기
  // 30초마다 자동으로 새로고침 (새 메시지 미리보기 갱신)
  const { data: rooms = [], isLoading } = useQuery({
    queryKey:        ['rooms'],
    queryFn:         getRooms,
    refetchInterval: 30 * 1000   // 30초마다 자동 갱신
  })

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-gray-400">채팅방 목록 로딩 중...</div>
      </div>
    )
  }

  // 채팅방이 없을 때
  if (rooms.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4 text-center">
        <span className="text-3xl">💬</span>
        <p className="text-sm text-gray-400">아직 대화한 채팅방이 없어요.</p>
        <p className="text-xs text-gray-300">친구를 추가하고 대화를 시작해보세요!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {rooms.map((room) => {
        // 채팅방 참여자 중 나를 제외한 상대방 추출
        const partner = room.participants?.find(p => p._id !== currentUser?.id)

        // 이 채팅방이 현재 선택됐는지
        const isSelected = room._id === selectedRoomId

        return (
          // 채팅방 항목
          <div
            key={room._id}
            onClick={() => onSelectRoom(room)}  // 클릭 시 부모 컴포넌트 함수 호출
            className={`
              flex items-center gap-3
              px-4 py-3
              cursor-pointer
              transition-colors duration-100
              border-b border-gray-50
              ${isSelected
                ? 'bg-purple-50'      // 선택된 채팅방: 연한 보라색 배경
                : 'hover:bg-gray-50'  // 호버 시: 연한 회색
              }
            `}
          >
            {/* 상대방 아바타 */}
            <UserAvatar
              name={partner?.name || '?'}
              imageUrl={partner?.profileImage}
              size="md"
              isOnline={partner?.isOnline}
            />

            {/* 채팅방 정보 */}
            <div className="flex-1 min-w-0">  {/* min-w-0: flex 자식이 너무 커지지 않게 */}
              {/* 상단: 이름 + 시간 */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {partner?.name || '알 수 없음'}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                  {formatLastTime(room.lastMessageAt)}
                </span>
              </div>

              {/* 하단: 마지막 메시지 미리보기 */}
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {room.lastMessage || '대화를 시작해보세요'}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RoomList
