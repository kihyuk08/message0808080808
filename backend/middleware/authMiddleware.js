// ========================================
// 📁 backend/middleware/authMiddleware.js - JWT 인증 미들웨어 (기혁 담당)
// ========================================
// 이 파일은 로그인이 필요한 API를 보호해요.
// "미들웨어"는 요청이 실제 처리되기 전에 먼저 실행되는 코드예요.
//
// 작동 순서:
//  요청 도착 → authMiddleware 실행 → (성공) 라우터 처리
//                                  → (실패) 401 에러 반환
//
// JWT(JSON Web Token)란?
//  로그인 성공 시 서버가 발급하는 "통행증"이에요.
//  이 통행증을 요청 헤더에 붙여서 보내면 "나 로그인한 사람이에요"를 증명해요.
//  형식: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

const jwt = require('jsonwebtoken');

// req: 들어온 요청
// res: 내보낼 응답
// next: 다음 미들웨어 또는 라우터로 넘어가는 함수
const authMiddleware = (req, res, next) => {
  try {
    // 요청 헤더에서 Authorization 값 추출
    // 형식: "Bearer 토큰문자열"
    const authHeader = req.headers.authorization;

    // 헤더가 없거나 Bearer로 시작하지 않으면 401 에러
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: '로그인이 필요해요. 토큰을 헤더에 포함해주세요.'
      });
    }

    // "Bearer " (7자) 뒤의 토큰 부분만 추출
    const token = authHeader.split(' ')[1];

    // jwt.verify(): 토큰이 유효한지 검증
    //  - 위조되지 않았는지 (서명 확인)
    //  - 만료되지 않았는지 (expiresIn 확인)
    // 성공 시 토큰에 저장된 데이터(payload)를 반환해요
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
    );

    // 검증 성공! req.user에 userId를 저장해서 라우터에서 쓸 수 있게 해요
    // 예: req.user.userId → "64a1b2c3d4e5f6a7b8c9d0e1"
    req.user = decoded;

    // 다음 단계(실제 라우터)로 넘어가기
    next();

  } catch (error) {
    // 토큰 관련 에러 처리
    if (error.name === 'TokenExpiredError') {
      // 토큰 유효 기간이 지난 경우 (기본 7일)
      return res.status(401).json({
        message: '로그인 시간이 만료됐어요. 다시 로그인해주세요.'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      // 토큰이 위조되거나 형식이 잘못된 경우
      return res.status(401).json({
        message: '유효하지 않은 토큰이에요.'
      });
    }
    // 기타 오류
    return res.status(500).json({ message: '인증 처리 중 오류가 발생했어요.' });
  }
};

module.exports = authMiddleware;
