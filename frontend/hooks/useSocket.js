// ========================================
// 📁 frontend/hooks/useSocket.js - Socket.IO 연결 훅 (지후 담당)
// ========================================
// Socket.IO 연결을 관리하는 커스텀 훅이에요.
// 컴포넌트가 마운트(화면에 나타남)되면 소켓 연결하고,
// 언마운트(화면에서 사라짐)되면 연결을 끊어요.
//
// 이 훅이 하는 일:
//  1. Socket.IO 서버에 연결
//  2. 'receiveMessage' 이벤트를 듣고 Redux에 새 메시지 추가
//  3. 사용자 온라인/오프라인 상태 변경 처리
//  4. 컴포넌트 언마운트 시 소켓 연결 해제
//
// 영민의 messageSlice.addMessage와 협업해요!
//
// 사용법 (ChatWindow 컴포넌트에서):
//  const { socket, sendMessage } = useSocket(roomId)

import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector }       from 'react-redux'
import { io }                             from 'socket.io-client'
import { addMessage }                     from '../store/messageSlice'

// 서버 주소 (vite.config.js의 proxy 설정으로 '/'가 백엔드로 연결돼요)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/'

// ─────────────────────────────────────
// useSocket 커스텀 훅
// ─────────────────────────────────────
// roomId: 입장할 채팅방 ID (없으면 연결은 하되 방에 들어가지 않음)
const useSocket = (roomId) => {
  const dispatch = useDispatch()

  // useRef: 리렌더링해도 값이 유지되는 변수 (socket 객체를 저장)
  const socketRef = useRef(null)

  // Redux에서 로그인한 사용자 정보 가져오기
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    // 로그인 안 됐으면 소켓 연결 안 해요
    if (!user) return

    // Socket.IO 서버에 연결
    // io(): 소켓 연결 시작 (연결되면 'connect' 이벤트 발생)
    const socket = io(SOCKET_URL, {
      // auth: 소켓 연결 시 인증 정보 전달 (미들웨어에서 확인 가능)
      auth: { token: localStorage.getItem('token') }
    })
    socketRef.current = socket

    // 연결 성공 시
    socket.on('connect', () => {
      console.log('✅ 소켓 연결 성공!')
      // 서버에 내가 온라인임을 알림
      socket.emit('userOnline', user.id)
    })

    // 채팅방 입장
    if (roomId) {
      socket.emit('joinRoom', roomId)
    }

    // ─────────────────────────────────────
    // 새 메시지 수신 이벤트
    // 지후의 백엔드 socket/index.js에서 io.to(roomId).emit('receiveMessage', ...) 가 오면 실행
    // ─────────────────────────────────────
    socket.on('receiveMessage', (message) => {
      // 현재 방의 메시지만 Redux에 추가해요
      if (message.room === roomId) {
        dispatch(addMessage(message))  // messageSlice에 새 메시지 추가
      }
    })

    // 연결 에러 처리
    socket.on('connect_error', (err) => {
      console.error('소켓 연결 오류:', err.message)
    })

    // ─────────────────────────────────────
    // 컴포넌트 언마운트 시 정리 (cleanup)
    // ─────────────────────────────────────
    // useEffect에서 함수를 return하면 컴포넌트가 사라질 때 자동으로 실행돼요
    // 소켓 연결을 끊지 않으면 메모리 누수(leak)가 생겨요!
    return () => {
      console.log('소켓 연결 해제')
      socket.disconnect()
    }
  }, [roomId, user, dispatch])  // 이 값이 변경될 때마다 useEffect 재실행

  // ─────────────────────────────────────
  // 메시지 보내기 함수 (ChatWindow에서 사용)
  // ─────────────────────────────────────
  // useCallback: 불필요한 함수 재생성 방지 (성능 최적화)
  const sendMessage = useCallback((content) => {
    if (!socketRef.current || !roomId || !user) return

    // 서버의 socket/index.js에 있는 'sendMessage' 이벤트 핸들러로 전달
    socketRef.current.emit('sendMessage', {
      content,
      roomId,
      senderId:    user.id,
      senderName:  user.name,
      senderImage: user.profileImage || ''
    })
  }, [roomId, user])

  // 읽음 처리 함수
  const markAsRead = useCallback(() => {
    if (!socketRef.current || !roomId || !user) return
    socketRef.current.emit('readMessage', { roomId, userId: user.id })
  }, [roomId, user])

  return {
    socket:     socketRef.current,
    sendMessage,  // ChatWindow의 MessageInput에서 이 함수를 호출해요
    markAsRead
  }
}

export default useSocket
