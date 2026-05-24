// ========================================
// 📁 frontend/components/UserAvatar.jsx - 프로필 아바타 (예지 담당)
// ========================================
// 사용자 프로필 사진 또는 이름 이니셜을 원형으로 보여주는 재사용 컴포넌트예요.
// 프로필 사진이 없으면 이름의 첫 글자를 배경색과 함께 보여줘요.
//
// 사용 예시:
//  <UserAvatar name="기혁" size="md" />
//  <UserAvatar name="지후" imageUrl="https://..." size="sm" />
//  <UserAvatar name="예지" size="lg" isOnline={true} />

// ─────────────────────────────────────
// Props(프롭스)란?
//  부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법이에요.
//  HTML의 속성처럼 <UserAvatar name="기혁" /> 식으로 전달해요.
// ─────────────────────────────────────

// 사이즈별 Tailwind 클래스 매핑
const sizeClasses = {
  xs: 'w-6  h-6  text-xs',   // 아주 작은 (24px)
  sm: 'w-8  h-8  text-sm',   // 작은 (32px)
  md: 'w-10 h-10 text-base', // 기본 (40px)
  lg: 'w-12 h-12 text-lg',   // 큰 (48px)
  xl: 'w-16 h-16 text-xl'    // 아주 큰 (64px)
}

// 이름별 배경색 (이름의 첫 글자 기준으로 색을 정해요)
// 항상 같은 이름은 같은 색이 나오도록 일관성 있게
const bgColors = [
  'bg-purple-200 text-purple-800',  // 기혁 색
  'bg-green-200  text-green-800',   // 지후 색
  'bg-blue-200   text-blue-800',    // 예지 색
  'bg-orange-200 text-orange-800',  // 영민 색
  'bg-pink-200   text-pink-800',    // 서현 색
  'bg-yellow-200 text-yellow-800',
  'bg-indigo-200 text-indigo-800',
  'bg-red-200    text-red-800',
]

// 이름으로 배경색을 결정하는 함수 (항상 같은 이름 → 같은 색)
function getColorIndex(name) {
  if (!name) return 0
  // 이름의 첫 글자 Unicode 코드를 배열 크기로 나눈 나머지 = 배열 인덱스
  return name.charCodeAt(0) % bgColors.length
}

// ─────────────────────────────────────
// UserAvatar 컴포넌트
// ─────────────────────────────────────
// Props:
//  name     : 사용자 이름 (이니셜 표시용, 필수)
//  imageUrl : 프로필 사진 URL (있으면 이미지, 없으면 이니셜)
//  size     : 'xs' | 'sm' | 'md' | 'lg' | 'xl' (기본값: 'md')
//  isOnline : true면 초록 점(온라인 표시) 표시
//  className: 추가 CSS 클래스 (외부에서 마진 등 추가용)
function UserAvatar({ name, imageUrl, size = 'md', isOnline = false, className = '' }) {
  const sizeClass = sizeClasses[size] || sizeClasses.md
  const colorClass = bgColors[getColorIndex(name)]

  // 이름 첫 글자 (이니셜)
  const initial = name ? name.charAt(0) : '?'

  return (
    // relative: 자식의 absolute 포지션 기준점
    <div className={`relative flex-shrink-0 ${className}`}>

      {/* 아바타 원형 */}
      <div
        className={`
          ${sizeClass}
          rounded-full              // 완전한 원형
          flex items-center justify-center  // 가운데 정렬
          overflow-hidden           // 이미지가 원 밖으로 나가지 않게
          font-medium
          select-none              // 텍스트 선택 방지
          ${imageUrl ? '' : colorClass}  // 이미지 없으면 배경색
        `}
      >
        {imageUrl ? (
          // 프로필 사진이 있으면 이미지 표시
          <img
            src={imageUrl}
            alt={`${name} 프로필`}
            className="w-full h-full object-cover"  // 이미지를 원형에 꽉 채우기
          />
        ) : (
          // 프로필 사진이 없으면 이름 첫 글자
          <span>{initial}</span>
        )}
      </div>

      {/* 온라인 상태 표시 (초록 점) */}
      {isOnline && (
        <span
          className="
            absolute bottom-0 right-0   // 오른쪽 아래 구석에 배치
            w-2.5 h-2.5                  // 점 크기
            bg-green-400                 // 초록색
            rounded-full                 // 원형
            border-2 border-white        // 흰색 테두리 (아바타와 구분)
          "
        />
      )}
    </div>
  )
}

export default UserAvatar
