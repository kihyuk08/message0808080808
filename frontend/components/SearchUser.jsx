// ========================================
// 📁 frontend/components/SearchUser.jsx - 사용자 검색 (서현 담당)
// ========================================
// 이름이나 이메일로 사용자를 검색하고 친구 추가하는 컴포넌트예요.
// FriendsPage에서 사용해요.
//
// Debounce란?
//  입력할 때마다 API를 호출하면 서버에 부하가 생겨요.
//  예를 들어 "김민준"을 입력하면 "김", "김민", "김민준" 3번 호출돼요.
//  Debounce는 마지막 입력 후 300ms가 지나야 API를 호출해서 1번만 요청해요!

import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient }       from '@tanstack/react-query'
import { searchUsers, addFriend }            from '../api/userApi'   // 영민이 만든 함수
import UserAvatar                            from './UserAvatar'

function SearchUser() {
  // 검색어 상태
  const [query, setQuery]     = useState('')
  // 검색 결과 상태
  const [results, setResults] = useState([])
  // 검색 중 여부
  const [searching, setSearching] = useState(false)

  // React Query의 useMutation: 데이터를 변경하는 요청 처리 (친구 추가)
  // useQuery와 달리 useMutation은 수동으로 실행해요
  const queryClient = useQueryClient()

  const addFriendMutation = useMutation({
    mutationFn: addFriend,  // 친구 추가 API 함수

    // 성공 시
    onSuccess: () => {
      alert('친구 추가 완료!')
      // 친구 목록 캐시를 무효화해서 다시 불러오게 해요
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },

    // 실패 시
    onError: (error) => {
      const message = error.response?.data?.message || '친구 추가에 실패했어요.'
      alert(message)
    }
  })

  // ─────────────────────────────────────
  // Debounce 구현: 300ms 대기 후 검색
  // ─────────────────────────────────────
  useEffect(() => {
    // 검색어가 비어있으면 결과 초기화
    if (!query.trim()) {
      setResults([])
      return
    }

    setSearching(true)

    // setTimeout: 300ms 후에 검색 API 호출
    const timer = setTimeout(async () => {
      try {
        const users = await searchUsers(query)
        setResults(users)
      } catch (err) {
        console.error('검색 오류:', err)
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)  // 300ms = 0.3초 대기

    // 정리 함수: query가 또 바뀌면 이전 타이머 취소
    // 이게 없으면 빠르게 입력할 때 여러 번 API 호출이 발생해요
    return () => {
      clearTimeout(timer)
      setSearching(false)
    }
  }, [query])  // query가 바뀔 때마다 실행

  return (
    <div>
      {/* 검색 입력창 */}
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름 또는 이메일로 검색..."
          className="
            w-full pl-10 pr-4 py-2.5
            bg-gray-100
            rounded-xl
            text-sm
            focus:outline-none
            focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50
          "
        />
        {/* 검색 아이콘 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 검색 중 표시 */}
      {searching && (
        <p className="text-sm text-gray-400 text-center py-2">검색 중...</p>
      )}

      {/* 검색 결과 목록 */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 mb-2">검색 결과 {results.length}명</p>
          {results.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
            >
              {/* 사용자 아바타 */}
              <UserAvatar
                name={user.name}
                imageUrl={user.profileImage}
                size="sm"
                isOnline={user.isOnline}
              />

              {/* 사용자 정보 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                {user.statusMessage && (
                  <p className="text-xs text-gray-400 truncate">{user.statusMessage}</p>
                )}
              </div>

              {/* 친구 추가 버튼 */}
              <button
                onClick={() => addFriendMutation.mutate(user._id)}
                disabled={addFriendMutation.isPending}
                className="
                  flex-shrink-0
                  px-3 py-1.5
                  text-xs font-medium
                  bg-purple-600 text-white
                  rounded-lg
                  hover:bg-purple-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-150
                "
              >
                친구 추가
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 검색어 있는데 결과 없을 때 */}
      {query.trim() && !searching && results.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          "{query}"에 해당하는 사용자가 없어요.
        </p>
      )}
    </div>
  )
}

export default SearchUser
