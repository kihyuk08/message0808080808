// ========================================
// 📁 backend/app.js - 서버 메인 파일 (기혁 담당)
// ========================================
// 이 파일은 서버 전체를 시작하는 "입구" 역할이에요.
// 마치 레스토랑의 정문처럼, 모든 요청이 여기를 통해 들어와요.
//
// 이 파일이 하는 일:
//  1. Express 서버 초기화 (웹 서버 만들기)
//  2. 미들웨어 설정 (요청 전 공통 처리)
//  3. 라우터 연결 (기능별 담당 파일 연결)
//  4. MongoDB 데이터베이스 연결
//  5. Socket.IO 실시간 채팅 서버 초기화
//  6. 서버 실행
//
// 실행 방법: server/ 폴더에서 nodemon app.js (개발용)

// --- 필요한 라이브러리 불러오기 ---
// require()는 다른 파일/라이브러리를 가져오는 명령어예요
const express = require('express');       // 웹 서버를 쉽게 만들어주는 라이브러리
const { createServer } = require('http'); // Node.js 기본 HTTP 서버 모듈
const { Server } = require('socket.io'); // 실시간 통신 라이브러리 (채팅용)
const mongoose = require('mongoose');     // MongoDB를 쉽게 다루는 라이브러리
const cors = require('cors');            // 다른 주소(프론트)에서 요청 허용
const dotenv = require('dotenv');        // .env 파일의 비밀 설정을 읽어오는 라이브러리

// .env 파일 불러오기 (MONGODB_URI, JWT_SECRET 등을 환경변수로 등록)
// 이 코드는 반드시 다른 코드보다 먼저 실행돼야 해요
dotenv.config();

// --- Express 앱 생성 ---
const app = express();

// --- HTTP 서버 생성 ---
// Socket.IO는 Express 앱만으로는 안 돼요.
// Node.js의 기본 HTTP 서버를 만들어야 Socket.IO와 함께 쓸 수 있어요.
const httpServer = createServer(app);

// --- Socket.IO 서버 초기화 ---
const io = new Server(httpServer, {
  cors: {
    // 프론트엔드 주소에서 소켓 연결을 허용
    // 개발 중: http://localhost:5173 (Vite 개발 서버)
    // 배포 후: 실제 사이트 주소로 바꿔야 해요
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// --- 미들웨어 설정 ---
// 미들웨어: 요청이 라우터에 도달하기 전에 실행되는 공통 처리 코드

// CORS 설정: 프론트(localhost:5173)에서 백엔드(localhost:5000)로 요청할 때 허용
// 이게 없으면 브라우저가 "CORS 오류"를 내보내요
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true   // 쿠키/인증 헤더를 포함한 요청도 허용
}));

// JSON 파싱: 프론트가 보낸 JSON 데이터를 req.body로 쓸 수 있게 해줘요
// 예: { "email": "test@test.com", "password": "1234" } → req.body.email
app.use(express.json());

// --- 라우터 파일 연결 ---
// 각 기능을 담당하는 라우터 파일을 특정 URL 경로에 연결해요
const authRoutes    = require('./routes/auth');      // 로그인·회원가입
const messageRoutes = require('./routes/messages');  // 메시지 CRUD
const userRoutes    = require('./routes/users');      // 사용자 검색·친구

// 라우터 등록
// 예: POST /api/auth/login → backend/routes/auth.js의 /login 처리
app.use('/api/auth',     authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users',    userRoutes);

// 서버가 살아있는지 확인하는 기본 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '서버가 정상 작동 중이에요!' });
});

// --- Socket.IO 이벤트 핸들러 연결 ---
// 실시간 채팅 코드는 socket/ 폴더에 분리해놨어요
// io 객체를 넘겨서 소켓 이벤트를 등록해요
const setupSocket = require('./socket');
setupSocket(io);

// --- MongoDB 연결 ---
// MONGODB_URI는 backend/.env 파일에 저장해요
// 형식: mongodb+srv://아이디:비밀번호@cluster.mongodb.net/데이터베이스명
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/messenger';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB 연결 성공!');
  })
  .catch((err) => {
    console.error('❌ MongoDB 연결 실패:', err.message);
    console.error('   backend/.env 파일의 MONGODB_URI를 확인해주세요.');
    process.exit(1);  // DB 없으면 서버 실행 의미 없으니 종료
  });

// --- 서버 시작 ---
// PORT는 backend/.env에 설정하거나 기본값 5000을 사용해요
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 백엔드 서버 실행 중: http://localhost:${PORT}`);
  console.log('   Ctrl + C 를 눌러서 서버를 종료할 수 있어요.');
});

module.exports = { app, io };
