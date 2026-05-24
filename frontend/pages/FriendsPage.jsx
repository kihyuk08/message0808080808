// ========================================
// 📁 frontend/pages/FriendsPage.jsx - 친구 목록 페이지 (서현 담당)
// ========================================
// 친구 목록과 사용자 검색 기능을 보여주는 페이지예요.
// SearchUser(사용자 검색)와 FriendList(친구 목록)를 조합해서 구성해요.
//
// App.js의 <Route path="/friends"> 에 연결됐어요.
// 사이드바의 "친구" 버튼 클릭 시 이 페이지로 이동해요.

import { useState }    from 'react'
import { useQuery }    from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getFriends, createRoom } from '../api/userApi'  // 영민이 만든 함수 사용
import SearchUser from '../components/SearchUser'        // 서현 담당
import UserAvatar from '../components/UserAvatar'

function FriendsPage() {
  const navigate = useNavigate()

  // 탭 상태: 'friends' (내 친구) 또는 'search' (친구 찾기)
  const [activeTab, setActiveTab] = useState('friends')

  // React Query: 친구 목록 불러오기 (영민의 API 함수 사용)
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn:  getFriends
  })

  // 대화 시작 버튼 클릭 시 채팅방 생성 후 이동
  const handleStartChat = async (friendId) => {
    try {
      const room = await createRoom(friendId)  // 채팅방 생성 또는 기존 방 가져오기
      navigate('/')  // 채팅 메인으로 이동 (선택된 방은 ChatPage에서 처리)
    } catch (err) {
      alert('채팅방 생성에 실패했어요.')
    }
  }

  return (
    // 전체 화면
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* 왼쪽 패널 */}
      <div className="w-full max-w-lg mx-auto p-6">

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600"
          >
            {/* 뒤로가기 화살표 */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">친구</h1>
        </div>

        {/* 탭 버튼 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${activeTab === 'friends'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}
            `}
          >
            내 친구 ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${activeTab === 'search'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}
            `}
          >
            친구 찾기
          </button>
        </div>

        {/* ─── 내 친구 목록 탭 ─── */}
        {activeTab === 'friends' && (
          <div>
            {isLoading ? (
              <p className="text-sm text-gray-400 text-center py-8">불러오는 중...</p>
            ) : friends.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <span className="text-4xl block mb-3">👥</span>
                <p className="text-sm">아직 친구가 없어요.</p>
                <p className="text-xs mt-1">"친구 찾기" 탭에서 친구를 추가해보세요!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    {/* 친구 아바타 (온라인 상태 표시 포함) */}
                    <UserAvatar
                      name={friend.name}
                      imageUrl={friend.profileImage}
                      size="md"
                      isOnline={friend.isOnline}
                    />

                    {/* 친구 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{friend.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {friend.statusMessage || friend.email}
                      </p>
                      <p className="text-xs text-gray-300">
                        {friend.isOnline ? '🟢 온라인' : '⚫ 오프라인'}
                      </p>
                    </div>

                    {/* 대화 시작 버튼 */}
                    <button
                      onClick={() => handleStartChat(friend._id)}
                      className="
                        flex-shrink-0
                        px-3 py-1.5
                        text-xs font-medium
                        text-purple-600
                        border border-purple-200
                        rounded-lg
                        hover:bg-purple-50
                        transition-colors
                      "
                    >
                      대화하기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── 친구 찾기 탭 ─── */}
        {activeTab === 'search' && (
          // 서현이 만든 SearchUser 컴포넌트 (검색 + 친구 추가)
          <SearchUser />
        )}
      </div>
    </div>
  )
}

export default FriendsPage
