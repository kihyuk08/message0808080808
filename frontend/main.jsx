// ========================================
// 📁 frontend/main.jsx - React 앱 시작점
// ========================================
// 이 파일은 React 앱을 HTML에 붙이는 아주 짧은 파일이에요.
// index.html의 <div id="root"></div> 에 React 앱을 그려줘요.
// 거의 수정할 일 없어요.

import React    from 'react'
import ReactDOM from 'react-dom/client'
import App      from './App'
import './index.css'  // 전역 CSS (Tailwind 포함)

// document.getElementById('root'): index.html의 <div id="root">를 찾아요
// ReactDOM.createRoot(): React 18의 새로운 렌더링 방식
// .render(): App 컴포넌트를 root div에 그려요
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode: 개발 중에 잠재적인 문제를 더 빨리 발견할 수 있게 해줘요
  // 배포(build)할 때는 자동으로 빠져요
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
