// ========================================
// 📁 backend/routes/auth.js - 로그인·회원가입 API (기혁 담당)
// ========================================
// 이 파일은 로그인과 회원가입 요청을 처리해요.
// "라우터"는 특정 URL로 요청이 오면 어떻게 처리할지 정하는 것이에요.
//
// 이 파일이 담당하는 API:
//  POST /api/auth/register → 회원가입
//  POST /api/auth/login    → 로그인 (JWT 토큰 발급)
//  GET  /api/auth/me       → 내 정보 조회 (로그인 유지 확인용)
//
// 영민이 만드는 authApi.js에서 이 주소들을 Axios로 호출해요

const express = require('express');
const router  = express.Router();  // 라우터 객체 생성
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// ─────────────────────────────────────
// POST /api/auth/register - 회원가입
// ─────────────────────────────────────
// 프론트에서 { name, email, password } 를 body로 보내면 새 사용자를 만들어요
router.post('/register', async (req, res) => {
  try {
    // req.body: 프론트가 fetch/Axios로 보낸 JSON 데이터
    const { name, email, password } = req.body;

    // 입력값 검증: 필수 항목이 모두 있는지 확인
    if (!name || !email || !password) {
      return res.status(400).json({
        message: '이름, 이메일, 비밀번호를 모두 입력해주세요.'
      });
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      return res.status(400).json({
        message: '비밀번호는 6자 이상이어야 해요.'
      });
    }

    // 이미 가입된 이메일인지 확인
    // User.findOne({ email }): email이 일치하는 문서를 DB에서 하나 찾아요
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({  // 409: Conflict (충돌)
        message: '이미 사용 중인 이메일이에요.'
      });
    }

    // 새 사용자 문서 생성
    // 비밀번호는 User 모델의 pre('save') 훅에서 자동으로 bcrypt 암호화돼요
    const user = new User({ name, email, password });
    await user.save();  // MongoDB에 저장

    // 201 Created: 새 리소스가 성공적으로 만들어진 경우
    res.status(201).json({
      message: '회원가입 성공!',
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email
        // 비밀번호는 절대 응답에 포함하면 안 돼요!
      }
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      message: '서버 오류가 발생했어요. 잠시 후 다시 시도해주세요.'
    });
  }
});

// ─────────────────────────────────────
// POST /api/auth/login - 로그인
// ─────────────────────────────────────
// 프론트에서 { email, password } 를 보내면 JWT 토큰을 발급해요
// 이 토큰을 영민이 localStorage에 저장해서 로그인 유지에 사용해요
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력값 검증
    if (!email || !password) {
      return res.status(400).json({
        message: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    // DB에서 이메일로 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      // 보안상 "이메일이 없어요"가 아닌 "비밀번호 틀렸어요"로 통일
      return res.status(401).json({
        message: '이메일 또는 비밀번호가 틀렸어요.'
      });
    }

    // 비밀번호 검증 (User 모델에 정의한 comparePassword 메서드 사용)
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: '이메일 또는 비밀번호가 틀렸어요.'
      });
    }

    // JWT 토큰 생성
    // jwt.sign(payload, secret, options)
    //  - payload: 토큰에 담을 데이터 (userId만! 비밀번호 절대 안 됨)
    //  - secret : 토큰 서명에 사용하는 비밀 키 (.env에 저장)
    //  - expiresIn: 토큰 유효 기간 (7일 후 만료)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    // 온라인 상태로 업데이트
    await User.findByIdAndUpdate(user._id, { isOnline: true });

    // 응답: 토큰 + 사용자 기본 정보
    res.json({
      message: '로그인 성공!',
      token,   // 영민이 이 토큰을 localStorage.setItem('token', token) 으로 저장해요
      user: {
        id:            user._id,
        name:          user.name,
        email:         user.email,
        profileImage:  user.profileImage,
        statusMessage: user.statusMessage
      }
    });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했어요.' });
  }
});

// ─────────────────────────────────────
// GET /api/auth/me - 내 정보 조회
// ─────────────────────────────────────
// 앱 새로고침 시 localStorage의 토큰으로 내 정보를 다시 불러올 때 사용해요
// authMiddleware가 토큰을 검증하고 req.user.userId를 채워줘요
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // select('-password'): 비밀번호 필드를 제외하고 가져오기
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없어요.' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했어요.' });
  }
});

module.exports = router;
