// ========================================
// 📁 frontend/components/Sidebar.jsx - 좌측 사이드바 (예지 담당)
// ========================================
// 채팅 메인 화면의 왼쪽 사이드바예요.
// 상단에 내 프로필/메뉴, 아래에 채팅방 목록(RoomList)이 들어가요.
//
// 레이아웃 구조:
//  [Sidebar (240px 고정)] | [ChatWindow (나머지)]
//
// 이 컴포넌트는 틀(레이아웃, 스타일)만 담당하고,
// 채팅방 목록 내용은 서현의 RoomList 컴포넌트가 담당해요.
//
// Props:
//  onSelectRoom   : 채팅방 선택 시 호출할 함수
//  selectedRoomId : 현재 선택된 채팅방 ID

import { useSelector, useDispatch } from 'react-redux'
import { useNavigate }               from 'react-router-dom'
import { logoutUser }                from '../store/authSlice'
import RoomList                      from './RoomList'    // 서현 담당
import UserAvatar                    from './UserAvatar'

function Sidebar({ onSelectRoom, selectedRoomId }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  // Redux에서 로그인한 사용자 정보 가져오기
  const user = useSelector((state) => state.auth.user)

  // 로그아웃 처리
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠어요?')) {
      localStorage.removeItem('token')  // 토큰 삭제
      dispatch(logoutUser())            // Redux 상태 초기화
      navigate('/login')                // 로그인 페이지로 이동
    }
  }

  return (
    // 사이드바 컨테이너: 세로 flex, 흰색 배경, 오른쪽 테두리
    <div className="flex flex-col w-60 bg-white border-r border-gray-100 h-full flex-shrink-0">

      {/* 상단: 앱 이름 + 내 프로필 */}
      <div className="p-4 border-b border-gray-100">
        {/* 앱 이름 */}
        <h1 className="text-base font-semibold text-gray-900 mb-3">💬 동아리 메신저</h1>

        {/* 내 프로필 영역 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || '사용자'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.statusMessage || '상태메시지 없음'}</p>
          </div>
        </div>
      </div>

      {/* 네비게이션 버튼들 */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-50">
        <button
          onClick={() => navigate('/')}
          className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          {/* 채팅 아이콘 */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          채팅
        </button>

        <button
          onClick={() => navigate('/friends')}
          className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          {/* 친구 아이콘 */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          친구
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          {/* 프로필 아이콘 */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          프로필
        </button>

        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs text-red-400 hover:bg-red-50"
        >
          {/* 로그아웃 아이콘 */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          나가기
        </button>
      </div>

      {/* "채팅방" 섹션 제목 */}
      <div className="px-4 py-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">채팅방</span>
      </div>

      {/* 채팅방 목록 (서현의 RoomList 컴포넌트) */}
      <RoomList
        onSelectRoom={onSelectRoom}
        selectedRoomId={selectedRoomId}
      />
    </div>
  )
}

export default Sidebar
