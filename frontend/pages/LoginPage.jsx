// ========================================
// 📁 frontend/pages/LoginPage.jsx - 로그인·회원가입 페이지 (예지·영민 담당)
// ========================================
// 이 파일은 로그인과 회원가입 화면을 담당해요.
//
// 역할 분담:
//  예지: UI 레이아웃 (입력 폼, 버튼 디자인)
//  영민: API 연결 (authApi.login, authApi.register 호출)
//
// 작동 흐름:
//  1. 이메일·비밀번호 입력
//  2. 로그인 버튼 클릭 → authApi.login() 호출 (영민)
//  3. 성공 → JWT 토큰 저장 → Redux에 사용자 정보 저장 (영민)
//  4. 채팅 메인 페이지로 이동

import { useState }       from 'react'
import { useDispatch }    from 'react-redux'
import { useNavigate }    from 'react-router-dom'
import { login, register } from '../api/authApi'  // 영민이 만든 API 함수
import { setUser }        from '../store/authSlice'  // 영민이 만든 Redux 액션

function LoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  // 탭 상태: 'login' 또는 'register'
  const [activeTab, setActiveTab] = useState('login')

  // 로그인 폼 입력값 상태
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  // 회원가입 폼 입력값 상태
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  })

  // 에러 메시지 상태
  const [error,     setError]     = useState('')
  // 로딩 상태 (API 요청 중에 버튼 비활성화)
  const [isLoading, setIsLoading] = useState(false)

  // ─────────────────────────────────────
  // 로그인 처리 (영민 담당 로직)
  // ─────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()  // 폼 submit 기본 동작(페이지 새로고침) 방지
    setError('')
    setIsLoading(true)

    try {
      // authApi.login() 호출 → JWT 토큰 받기
      const { token, user } = await login(loginForm.email, loginForm.password)

      // Redux store에 사용자 정보와 토큰 저장
      dispatch(setUser({ user, token }))

      // 채팅 메인 페이지로 이동
      navigate('/')

    } catch (err) {
      // 서버에서 온 에러 메시지 표시
      setError(err.response?.data?.message || '로그인에 실패했어요.')
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────
  // 회원가입 처리 (영민 담당 로직)
  // ─────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // 비밀번호 일치 확인
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }

    setIsLoading(true)

    try {
      // 회원가입 API 호출
      await register(registerForm.name, registerForm.email, registerForm.password)

      alert('회원가입 성공! 로그인해주세요.')
      setActiveTab('login')  // 로그인 탭으로 이동

    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했어요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // 전체 화면 중앙 정렬
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">

      <div className="w-full max-w-sm">

        {/* 앱 로고 + 제목 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💬</div>
          <h1 className="text-2xl font-semibold text-gray-900">동아리 메신저</h1>
          <p className="text-sm text-gray-500 mt-1">팀원들과 실시간으로 소통해요</p>
        </div>

        {/* 카드 컨테이너 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* 탭 (로그인 / 회원가입) */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => { setActiveTab('login'); setError('') }}
              className={`
                flex-1 py-3 text-sm font-medium transition-colors
                ${activeTab === 'login'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              로그인
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError('') }}
              className={`
                flex-1 py-3 text-sm font-medium transition-colors
                ${activeTab === 'register'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              회원가입
            </button>
          </div>

          <div className="p-6">

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* ─── 로그인 폼 ─── */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">이메일</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="example@email.com"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">비밀번호</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="6자 이상"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
              </form>
            )}

            {/* ─── 회원가입 폼 ─── */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">이름</label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="홍길동"
                    required
                    maxLength={20}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">이메일</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="example@email.com"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">비밀번호</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="6자 이상"
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">비밀번호 확인</label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    placeholder="비밀번호 다시 입력"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '가입 중...' : '회원가입'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-xs text-gray-400 mt-6">
          동아리 메신저 프로젝트 — 기혁·지후·예지·영민·서현
        </p>
      </div>
    </div>
  )
}

export default LoginPage
