// ========================================
// 📁 backend/models/User.js - 사용자 DB 설계도 (기혁 담당)
// ========================================
// MongoDB에 사용자 정보를 어떻게 저장할지 "설계도(Schema)"를 만드는 파일이에요.
// 마치 엑셀 표의 컬럼(열)을 정의하는 것처럼,
// 어떤 정보를 어떤 타입으로 저장할지 정해요.
//
// Mongoose(몽구스)란?
//  MongoDB를 JavaScript에서 편하게 쓸 수 있게 도와주는 라이브러리예요.
//  SQL의 ORM처럼, 복잡한 DB 쿼리를 간단한 JS 코드로 처리할 수 있어요.

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');  // 비밀번호 암호화 라이브러리

// --- 사용자 스키마(Schema) 정의 ---
// Schema = 데이터의 구조(형태)를 정의하는 것
const userSchema = new mongoose.Schema({

  // 사용자 이름 (예: "김민준")
  name: {
    type:     String,   // 문자열 타입
    required: true,     // 필수값 (없으면 저장 거부)
    trim:     true,     // 앞뒤 공백 자동 제거
    maxlength: 20       // 최대 20자
  },

  // 이메일 주소 (로그인 아이디로 사용)
  email: {
    type:      String,
    required:  true,
    unique:    true,        // DB 수준에서 중복 이메일 차단
    lowercase: true,        // 자동으로 소문자 변환 ("ABC@Test.com" → "abc@test.com")
    trim:      true
  },

  // 비밀번호
  // ⚠️ 원본 비밀번호는 절대 저장하면 안 돼요!
  // 저장 직전에 아래 pre('save') 훅에서 자동으로 bcrypt 암호화가 돼요.
  password: {
    type:      String,
    required:  true,
    minlength: 6       // 최소 6자
  },

  // 프로필 사진 URL (이미지 파일 자체가 아니라 주소를 저장)
  // 예: "https://서버주소/uploads/프로필.jpg"
  profileImage: {
    type:    String,
    default: ''        // 기본값: 빈 문자열 (사진 없음)
  },

  // 상태 메시지 (예: "오늘도 화이팅!")
  statusMessage: {
    type:      String,
    default:   '',
    maxlength: 100
  },

  // 친구 목록: 다른 User 문서들의 ID 배열
  // ObjectId: MongoDB가 각 문서에 자동 부여하는 고유 ID예요 (24자리 16진수)
  // ref: 'User'  → 나중에 populate()로 실제 사용자 정보를 가져올 수 있어요
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User'
  }],

  // 현재 온라인 상태 (true: 접속 중, false: 오프라인)
  isOnline: {
    type:    Boolean,
    default: false
  }

}, {
  // timestamps: true → createdAt(생성일), updatedAt(수정일)을 자동으로 추가해줘요
  timestamps: true
});

// ─────────────────────────────────────
// 비밀번호 자동 암호화 (저장 직전 실행)
// ─────────────────────────────────────
// pre('save'): 문서가 DB에 저장되기 "직전"에 자동으로 실행되는 함수
// 비밀번호가 변경됐을 때만 다시 암호화해요 (변경 안 됐으면 그냥 넘어가요)
userSchema.pre('save', async function (next) {
  // this = 지금 저장할 User 문서
  // isModified('password'): password 필드가 이번에 변경됐는지 확인
  if (!this.isModified('password')) return next();

  // bcrypt.hash(원본, 복잡도)
  // 복잡도(salt rounds) 10 = 보안과 속도의 적절한 균형
  // 숫자가 높을수록 더 안전하지만 느려요 (보통 10~12)
  this.password = await bcrypt.hash(this.password, 10);

  next(); // 다음 단계(실제 저장)로 넘어가기
});

// ─────────────────────────────────────
// 비밀번호 검증 메서드
// ─────────────────────────────────────
// 로그인할 때 입력한 비밀번호와 DB에 저장된 암호화 비밀번호를 비교해요
// 사용법: const isValid = await user.comparePassword("입력한비밀번호");
userSchema.methods.comparePassword = async function (inputPassword) {
  // bcrypt.compare(): 원본 문자열과 bcrypt 해시를 비교
  // 같으면 true, 다르면 false 반환
  return await bcrypt.compare(inputPassword, this.password);
};

// --- 모델 생성 ---
// mongoose.model('User', userSchema)
//  → MongoDB에 'users' 컬렉션(테이블)을 만들고 User 모델로 조작할 수 있어요
//  → 'User'가 자동으로 소문자 복수형 'users'로 변환돼요
const User = mongoose.model('User', userSchema);

module.exports = User;
