// ========================================
// 📁 frontend/App.js - React 앱 최상위 (영민 담당)
// ========================================
// 이 파일은 React 앱의 "뼈대"예요.
// Provider 설정과 라우팅(페이지 이동)을 여기서 담당해요.
//
// 이 파일이 하는 일:
//  1. QueryClientProvider 설정 → React Query 사용 가능하게
//  2. Provider(Redux store) 설정 → Redux 상태관리 사용 가능하게
//  3. BrowserRouter + Routes 설정 → URL에 따라 페이지 이동
//  4. 앱 시작 시 자동 로그인 처리 (토큰이 있으면 내 정보 불러오기)
//
// ⚠️ Provider 두 개를 빠뜨리면 React Query·Redux가 전혀 작동 안 해요!

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://0mani:a4959@7956@cluster0.rku1efx.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import store from './store'
import { setUser, logoutUser } from './store/authSlice'
import { getMyInfo } from './api/authApi'

// 각 페이지 컴포넌트
import LoginPage   from './pages/LoginPage'
import ChatPage    from './pages/ChatPage'
import FriendsPage from './pages/FriendsPage'
import ProfilePage from './pages/ProfilePage'
import Notification from './components/Notification'

// React Query 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5분
      retry:     1
    }
  }
})

// ─────────────────────────────────────
// 로그인 보호 컴포넌트
// ─────────────────────────────────────
// 로그인하지 않은 사용자가 비공개 페이지에 접근하면 로그인으로 이동
function PrivateRoute({ children }) {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}

// ─────────────────────────────────────
// 앱 내부 컴포넌트 (store에 접근 가능)
// ─────────────────────────────────────
function AppInner() {
  const dispatch  = useDispatch()
  const { isLoggedIn, user, token } = useSelector((state) => state.auth)

  // 앱 시작 시: 토큰은 있지만 사용자 정보가 없으면 API로 가져오기
  // 새로고침했을 때 Redux 상태가 초기화되지만 localStorage 토큰은 남아있어서
  // 서버에서 사용자 정보를 다시 가져와야 해요
  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const userData = await getMyInfo()
          dispatch(setUser({ user: userData, token }))
        } catch (err) {
          // 토큰이 만료됐거나 유효하지 않으면 로그아웃
          localStorage.removeItem('token')
          dispatch(logoutUser())
        }
      }
    }
    fetchUser()
  }, [token, user, dispatch])

  return (
    <BrowserRouter>
      {/* 알림 컴포넌트: 화면 우측 상단에 항상 표시 */}
      <Notification />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={
          <PrivateRoute><ChatPage /></PrivateRoute>
        } />

        <Route path="/friends" element={
          <PrivateRoute><FriendsPage /></PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        } />

        {/* 없는 주소로 접속하면 메인으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

// ─────────────────────────────────────
// 메인 App 컴포넌트
// ─────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AppInner />
      </Provider>
    </QueryClientProvider>
  )
}

export default App
