// ========================================
// 📁 frontend/components/Notification.jsx - 알림 컴포넌트 (서현 담당)
// ========================================
// 새 메시지, 친구 요청 등의 알림을 화면 우측 상단에 팝업으로 보여줘요.
// App.js에서 전체 앱을 감싸듯 렌더링하기 때문에 어디서든 알림이 표시돼요.
//
// 이 컴포넌트가 하는 일:
//  1. 알림 상태를 관리 (알림 추가, 제거)
//  2. 알림을 3초 후 자동으로 사라지게
//  3. X 버튼으로 수동 닫기
//
// 실제 프로젝트에서는 소켓 이벤트(지후 담당)와 연결해서
// 새 메시지가 오면 이 컴포넌트에 알림을 보내요.

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'

// 알림 타입별 스타일 설정
const notificationStyles = {
  message: {
    bg:   'bg-purple-600',
    icon: '💬'
  },
  friend: {
    bg:   'bg-green-600',
    icon: '👋'
  },
  error: {
    bg:   'bg-red-500',
    icon: '⚠️'
  },
  info: {
    bg:   'bg-blue-500',
    icon: 'ℹ️'
  }
}

// ─────────────────────────────────────
// Notification 컴포넌트
// ─────────────────────────────────────
function Notification() {
  // 알림 배열: [{ id, type, title, message }]
  const [notifications, setNotifications] = useState([])

  // 현재 보고 있는 채팅방 (이 채팅방의 메시지는 알림 안 보여줘도 됨)
  const currentRoomId = useSelector((state) => state.message.currentRoomId)

  // 알림 추가 함수 (useCallback: 불필요한 재생성 방지)
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random()  // 고유 ID 생성
    setNotifications(prev => [...prev, { ...notification, id }])

    // 3초 후 자동으로 해당 알림 제거
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }, [])

  // 수동으로 알림 닫기
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // 전역에서 알림을 추가할 수 있도록 window 객체에 함수 등록
  // 다른 컴포넌트에서: window.showNotification({ type: 'message', title: '새 메시지', message: '안녕!' })
  useEffect(() => {
    window.showNotification = addNotification
    return () => {
      delete window.showNotification
    }
  }, [addNotification])

  // 알림이 없으면 아무것도 렌더링 안 함
  if (notifications.length === 0) return null

  return (
    // 화면 우측 상단에 고정 위치
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notif) => {
        const style = notificationStyles[notif.type] || notificationStyles.info

        return (
          <div
            key={notif.id}
            className={`
              ${style.bg} text-white
              px-4 py-3
              rounded-xl shadow-lg
              max-w-xs w-full
              flex items-start gap-3
              pointer-events-auto
              animate-pulse
            `}
          >
            {/* 아이콘 */}
            <span className="text-lg flex-shrink-0">{style.icon}</span>

            {/* 알림 내용 */}
            <div className="flex-1 min-w-0">
              {notif.title && (
                <p className="text-sm font-semibold truncate">{notif.title}</p>
              )}
              {notif.message && (
                <p className="text-xs opacity-90 truncate">{notif.message}</p>
              )}
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => removeNotification(notif.id)}
              className="text-white opacity-70 hover:opacity-100 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default Notification
