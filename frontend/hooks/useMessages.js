// ========================================
// 📁 frontend/hooks/useMessages.js - 메시지 불러오기 훅 (영민 담당)
// ========================================
// React Query를 사용해서 특정 채팅방의 과거 메시지를 불러오는 커스텀 훅이에요.
//
// React Query를 쓰면 좋은 점:
//  - 로딩 상태, 에러 상태를 자동으로 관리해줘요
//  - 같은 데이터를 여러 곳에서 요청해도 한 번만 API 호출해요 (캐싱)
//  - 일정 시간마다 자동으로 새로고침해요 (refetchInterval)
//
// 사용법 (ChatWindow 컴포넌트에서):
//  const { messages, isLoading, error } = useMessages(roomId)

import { useQuery }    from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { useEffect }   from 'react'
import { getMessages } from '../api/messageApi'
import { setMessages } from '../store/messageSlice'

// ─────────────────────────────────────
// useMessages 커스텀 훅
// ─────────────────────────────────────
// roomId: 메시지를 가져올 채팅방 ID
// roomId가 null이면 요청하지 않아요 (enabled: false)
const useMessages = (roomId) => {
  const dispatch = useDispatch()

  // useQuery: 서버에서 데이터를 가져오는 React Query 훅
  const queryResult = useQuery({
    // queryKey: 이 쿼리의 고유 키 (캐싱에 사용)
    // roomId가 바뀌면 자동으로 새로 요청해요
    queryKey: ['messages', roomId],

    // queryFn: 실제 데이터를 가져오는 함수
    queryFn: () => getMessages(roomId),

    // enabled: false면 자동으로 실행되지 않아요
    // roomId가 있을 때만 실행
    enabled: !!roomId,

    // staleTime: 5분 동안은 캐시된 데이터를 "신선하다"고 봐요
    // 5분 이내에 같은 roomId로 요청하면 서버에 다시 요청하지 않아요
    staleTime: 5 * 60 * 1000,

    // refetchOnWindowFocus: 브라우저 탭을 다시 클릭할 때 자동 새로고침
    refetchOnWindowFocus: true
  })

  // 데이터를 받아오면 Redux store에도 저장 (실시간 메시지와 합치기 위해)
  useEffect(() => {
    if (queryResult.data) {
      dispatch(setMessages(queryResult.data))
    }
  }, [queryResult.data, dispatch])

  return {
    messages:  queryResult.data || [],  // 메시지 배열 (없으면 빈 배열)
    isLoading: queryResult.isLoading,   // true: 불러오는 중
    error:     queryResult.error,       // null: 에러 없음
    refetch:   queryResult.refetch      // 수동으로 다시 불러올 때 호출
  }
}

export default useMessages
