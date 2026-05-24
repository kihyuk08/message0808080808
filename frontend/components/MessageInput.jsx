// ========================================
// 📁 frontend/components/MessageInput.jsx - 메시지 입력창 (예지 담당)
// ========================================
// 채팅 메시지를 입력하고 전송하는 컴포넌트예요.
// 버튼 클릭 또는 Enter 키로 전송할 수 있어요.
//
// Props:
//  onSend   : 함수 - 메시지 전송 시 호출 (부모 컴포넌트에서 받아요)
//  disabled : boolean - true면 입력 비활성화 (채팅방 미선택 시)
//
// UI와 로직 분리 원칙:
//  이 컴포넌트는 "어떻게 생겼나"만 담당해요.
//  실제 전송 로직(소켓 emit)은 ChatWindow에서 onSend props로 전달받아요.
//
// 사용 예시:
//  <MessageInput onSend={handleSend} />

import { useState, useRef } from 'react'

function MessageInput({ onSend, disabled = false }) {
  // useState: 입력창의 현재 값을 상태로 관리
  // text: 현재 입력된 문자열 / setText: 변경 함수
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // 전송 처리 함수
  const handleSend = () => {
    const trimmed = text.trim()  // 앞뒤 공백 제거
    if (!trimmed || disabled) return  // 빈 메시지면 전송 안 함

    onSend(trimmed)    // 부모 컴포넌트의 onSend 함수 호출
    setText('')        // 입력창 비우기
    textareaRef.current?.focus()  // 전송 후 입력창에 포커스 유지
  }

  // 키보드 이벤트 처리
  const handleKeyDown = (e) => {
    // Enter 키만 눌렀을 때 전송 (Shift+Enter는 줄바꿈)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()  // Enter 키의 기본 동작(줄바꿈) 방지
      handleSend()
    }
  }

  return (
    // 입력 영역 전체 컨테이너
    <div className="flex items-end gap-2 p-4 border-t border-gray-100 bg-white">

      {/* 텍스트 입력창 */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}  // 입력값 변경 시 상태 업데이트
          onKeyDown={handleKeyDown}
          placeholder={disabled ? '채팅방을 선택해주세요' : '메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)'}
          disabled={disabled}
          rows={1}
          className="
            w-full px-4 py-2.5
            bg-gray-100
            rounded-2xl
            text-sm
            resize-none              // 수동 크기 조절 비활성화
            max-h-32                 // 최대 높이 (너무 커지지 않게)
            overflow-y-auto          // 내용이 넘치면 스크롤
            disabled:cursor-not-allowed  // 비활성화 시 커서 변경
            disabled:opacity-50
            focus:outline-none
            focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50
          "
          style={{
            // 입력 내용에 따라 높이 자동 조절
            height: 'auto',
            lineHeight: '1.5'
          }}
        />
      </div>

      {/* 전송 버튼 */}
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}  // 비어있거나 비활성화면 버튼 비활성화
        className="
          flex-shrink-0             // 버튼 크기 고정 (입력창이 커져도 버튼 유지)
          w-10 h-10
          rounded-full
          flex items-center justify-center
          transition-colors duration-150  // 색상 변환 애니메이션
          bg-purple-600 text-white        // 활성화: 보라색
          hover:bg-purple-700
          disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed  // 비활성화: 회색
        "
        title="메시지 전송 (Enter)"
      >
        {/* 전송 아이콘 (SVG) */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </div>
  )
}

export default MessageInput
