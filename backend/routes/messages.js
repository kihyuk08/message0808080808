// ========================================
// 📁 backend/routes/messages.js - 메시지 API (기혁 담당)
// ========================================
// 채팅 메시지를 불러오고 저장하는 API예요.
//
// 이 파일이 담당하는 API:
//  GET  /api/messages/:roomId → 특정 채팅방의 과거 메시지 목록 조회
//  POST /api/messages          → 새 메시지를 DB에 저장
//
// 영민이 만드는 useMessages.js (React Query 훅)이 GET 주소를 호출해요
// Socket.IO로 전송된 메시지도 여기서 DB에 저장해요

const express = require('express');
const router  = express.Router();
const Message = require('../models/Message');
const Room    = require('../models/Room');
const authMiddleware = require('../middleware/authMiddleware');

// 이 라우터의 모든 API는 로그인 필수
// router.use(authMiddleware) = 이 파일의 모든 라우터에 미들웨어 적용
router.use(authMiddleware);

// ─────────────────────────────────────
// GET /api/messages/:roomId - 메시지 목록 조회
// ─────────────────────────────────────
// :roomId 는 URL 파라미터예요
// 예: GET /api/messages/64a1b2c3d4e5f6a7b8c9d0e1
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    // 페이지네이션 설정
    // 메시지가 수천 개면 한 번에 다 가져오면 느려요
    // limit: 한 번에 가져올 메시지 수 (기본 50개)
    // page: 몇 번째 페이지 (기본 1페이지)
    const limit = parseInt(req.query.limit) || 50;
    const page  = parseInt(req.query.page)  || 1;
    const skip  = (page - 1) * limit;  // 건너뛸 개수

    // 해당 채팅방 메시지 조회
    const messages = await Message.find({ room: roomId })
      // populate(): sender ID를 실제 사용자 정보(이름, 프로필사진)로 변환
      // 결과: { sender: "64a1..." } → { sender: { name: "기혁", profileImage: "..." } }
      .populate('sender', 'name profileImage')
      .sort({ createdAt: 1 })  // 1 = 오름차순 (오래된 메시지부터) = 채팅창 순서
      .skip(skip)
      .limit(limit);

    // 내가 받은 읽지 않은 메시지들을 읽음 처리
    // $ne: not equal (sender가 나 자신이 아닌 것들만)
    // $ne를 쓰지 않으면 내가 보낸 메시지도 읽음 처리됨
    await Message.updateMany(
      {
        room:   roomId,
        sender: { $ne: req.user.userId },
        isRead: false
      },
      { isRead: true }
    );

    res.json({ messages, totalCount: messages.length });

  } catch (error) {
    console.error('메시지 조회 오류:', error);
    res.status(500).json({ message: '메시지를 불러오는 데 실패했어요.' });
  }
});

// ─────────────────────────────────────
// POST /api/messages - 메시지 저장
// ─────────────────────────────────────
// body: { content, roomId }
// Socket.IO로 실시간 전송과 별개로 DB에도 저장해야 과거 메시지를 조회할 수 있어요
router.post('/', async (req, res) => {
  try {
    const { content, roomId } = req.body;

    if (!content || !roomId) {
      return res.status(400).json({
        message: '메시지 내용과 채팅방 ID가 필요해요.'
      });
    }

    // 새 메시지 문서 생성
    const message = new Message({
      content,
      sender: req.user.userId,  // authMiddleware가 넣어준 로그인한 사용자 ID
      room:   roomId
    });
    await message.save();

    // 저장된 메시지에 sender 정보를 추가해서 반환
    await message.populate('sender', 'name profileImage');

    // 채팅방의 마지막 메시지 정보 업데이트 (RoomList 미리보기에 표시)
    await Room.findByIdAndUpdate(roomId, {
      lastMessage:   content,
      lastMessageAt: new Date()
    });

    res.status(201).json({ message });

  } catch (error) {
    console.error('메시지 저장 오류:', error);
    res.status(500).json({ message: '메시지 전송에 실패했어요.' });
  }
});

module.exports = router;
