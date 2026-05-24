// ========================================
// 📁 frontend/pages/ProfilePage.jsx - 프로필 페이지 (서현 담당)
// ========================================
// 내 프로필을 보고 수정하는 페이지예요.
// 이름, 상태메시지, 프로필 사진을 수정할 수 있어요.
//
// App.js의 <Route path="/profile"> 에 연결됐어요.
// 사이드바의 "프로필" 버튼 클릭 시 이 페이지로 이동해요.
//
// 영민의 Redux authSlice의 updateUser 액션을 사용해서
// 수정 후 앱 전체에서 바뀐 정보를 볼 수 있어요.

import { useState }                 from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate }               from 'react-router-dom'
import api                          from '../api/client'      // Axios 인스턴스
import { updateUser, logoutUser }   from '../store/authSlice' // 영민이 만든 액션
import UserAvatar                   from '../components/UserAvatar'

function ProfilePage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  // Redux에서 현재 사용자 정보 가져오기
  const user = useSelector((state) => state.auth.user)

  // 폼 입력값 상태 (초기값: 현재 사용자 정보로 채우기)
  const [formData, setFormData] = useState({
    name:          user?.name          || '',
    statusMessage: user?.statusMessage || ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message,   setMessage]   = useState('')  // 성공/실패 메시지

  // 폼 입력값 변경 핸들러 (name, statusMessage 공통)
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // ─────────────────────────────────────
  // 프로필 저장
  // ─────────────────────────────────────
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMessage('이름을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      // 서버에 프로필 수정 요청
      // PATCH: 일부만 수정 (전체를 바꾸는 PUT과 달리)
      const response = await api.patch('/users/profile', {
        name:          formData.name.trim(),
        statusMessage: formData.statusMessage.trim()
      })

      // Redux store의 사용자 정보 업데이트
      dispatch(updateUser({
        name:          formData.name.trim(),
        statusMessage: formData.statusMessage.trim()
      }))

      setMessage('프로필이 저장됐어요!')

    } catch (err) {
      setMessage(err.response?.data?.message || '저장에 실패했어요.')
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────
  // 로그아웃
  // ─────────────────────────────────────
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠어요?')) {
      localStorage.removeItem('token')
      dispatch(logoutUser())
      navigate('/login')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="w-full max-w-md mx-auto p-6 overflow-y-auto">

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">내 프로필</h1>
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

          {/* 프로필 사진 */}
          <div className="flex flex-col items-center mb-6">
            <UserAvatar
              name={user?.name || '나'}
              imageUrl={user?.profileImage}
              size="xl"
              isOnline={true}
              className="mb-3"
            />
            {/* 사진 변경 버튼 (기능 확장용 - 현재는 안내만) */}
            <button className="text-xs text-purple-600 hover:text-purple-700">
              사진 변경 (확장 예정)
            </button>
          </div>

          {/* 이름 수정 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              maxLength={20}
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
            />
          </div>

          {/* 이메일 (변경 불가) */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">이메일</label>
            <div className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-500">
              {user?.email}
            </div>
          </div>

          {/* 상태 메시지 수정 */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">상태 메시지</label>
            <input
              type="text"
              value={formData.statusMessage}
              onChange={(e) => handleChange('statusMessage', e.target.value)}
              placeholder="상태메시지를 입력하세요 (예: 오늘도 화이팅!)"
              maxLength={100}
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
            />
          </div>

          {/* 결과 메시지 */}
          {message && (
            <p className={`text-sm text-center mb-4 ${
              message.includes('실패') ? 'text-red-500' : 'text-green-600'
            }`}>
              {message}
            </p>
          )}

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 text-red-500 text-sm font-medium border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
