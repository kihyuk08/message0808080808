// ========================================
// 📁 backend/routes/users.js - 사용자·친구·채팅방 API (기혁 담당)
// ========================================
// 사용자 검색, 친구 추가, 채팅방 생성/조회 API예요.
//
// 이 파일이 담당하는 API:
//  GET  /api/users/search?q=검색어   → 이름/이메일로 사용자 검색
//  GET  /api/users/friends            → 내 친구 목록 조회
//  POST /api/users/friends/:userId    → 친구 추가
//  GET  /api/users/rooms              → 내 채팅방 목록 조회
//  POST /api/users/rooms              → 채팅방 생성 (이미 있으면 기존 방 반환)
//
// 서현이 만드는 SearchUser.jsx, RoomList.jsx 에서 이 API를 호출해요

const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Room    = require('../models/Room');
const authMiddleware = require('../middleware/authMiddleware');

// 모든 API 로그인 필수
router.use(authMiddleware);

// ─────────────────────────────────────
// GET /api/users/search?q=검색어 - 사용자 검색
// ─────────────────────────────────────
// 서현의 SearchUser 컴포넌트에서 300ms 딜레이(debounce) 후 호출해요
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;  // URL 쿼리 파라미터: /search?q=김민준

    if (!q || q.trim().length < 1) {
      return res.status(400).json({ message: '검색어를 입력해주세요.' });
    }

    // MongoDB 검색 조건
    // $and: 두 조건을 모두 만족해야 함
    //  1. 본인 제외 ($ne: not equal)
    //  2. 이름 또는 이메일에 검색어 포함
    // $or: 둘 중 하나라도 만족하면 됨
    // $regex: 정규표현식 (부분 문자열 검색)
    // $options: 'i' = 대소문자 구분 없이 (case-insensitive)
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.userId } },  // 본인 제외
        {
          $or: [
            { name:  { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name email profileImage statusMessage isOnline')  // 비밀번호 제외
    .limit(20);  // 최대 20명

    res.json({ users });

  } catch (error) {
    console.error('사용자 검색 오류:', error);
    res.status(500).json({ message: '검색에 실패했어요.' });
  }
});

// ─────────────────────────────────────
// GET /api/users/friends - 내 친구 목록
// ─────────────────────────────────────
router.get('/friends', async (req, res) => {
  try {
    // 현재 사용자를 찾고 friends 배열을 실제 사용자 정보로 채워서 반환
    // populate(): friends 배열의 ID들을 실제 User 문서 정보로 변환
    const user = await User.findById(req.user.userId)
      .populate('friends', 'name email profileImage statusMessage isOnline');

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없어요.' });
    }

    res.json({ friends: user.friends });

  } catch (error) {
    res.status(500).json({ message: '친구 목록을 불러오는 데 실패했어요.' });
  }
});

// ─────────────────────────────────────
// POST /api/users/friends/:userId - 친구 추가
// ─────────────────────────────────────
// 서현의 SearchUser에서 "친구 추가" 버튼 클릭 시 호출해요
router.post('/friends/:userId', async (req, res) => {
  try {
    const { userId } = req.params;  // 친구로 추가할 상대방 ID
    const myId = req.user.userId;   // 내 ID

    // 자기 자신 추가 방지
    if (userId === myId.toString()) {
      return res.status(400).json({ message: '자기 자신을 친구 추가할 수 없어요.' });
    }

    // 상대방이 실제 존재하는지 확인
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: '해당 사용자를 찾을 수 없어요.' });
    }

    // 이미 친구인지 확인
    const me = await User.findById(myId);
    if (me.friends.includes(userId)) {
      return res.status(409).json({ message: '이미 친구예요.' });
    }

    // 양방향 친구 추가 (나 → 상대방, 상대방 → 나)
    // $push: 배열에 새 항목 추가
    await User.findByIdAndUpdate(myId,   { $push: { friends: userId } });
    await User.findByIdAndUpdate(userId, { $push: { friends: myId   } });

    res.json({ message: '친구 추가 완료!' });

  } catch (error) {
    console.error('친구 추가 오류:', error);
    res.status(500).json({ message: '친구 추가에 실패했어요.' });
  }
});

// ─────────────────────────────────────
// GET /api/users/rooms - 내 채팅방 목록
// ─────────────────────────────────────
// 서현의 RoomList 컴포넌트에서 호출해요
router.get('/rooms', async (req, res) => {
  try {
    // 내가 참여한 채팅방을 최신 메시지 순으로 정렬
    const rooms = await Room.find({ participants: req.user.userId })
      .populate('participants', 'name profileImage isOnline')
      .sort({ lastMessageAt: -1 });  // -1 = 내림차순 (최신순)

    res.json({ rooms });

  } catch (error) {
    res.status(500).json({ message: '채팅방 목록을 불러오는 데 실패했어요.' });
  }
});

// ─────────────────────────────────────
// POST /api/users/rooms - 채팅방 생성 또는 기존 방 반환
// ─────────────────────────────────────
// 두 사람이 이미 채팅 중이면 기존 방을, 없으면 새로 만들어 반환해요
// body: { participantId } = 채팅 상대방 ID
router.post('/rooms', async (req, res) => {
  try {
    const { participantId } = req.body;
    const myId = req.user.userId;

    // 이미 이 두 사람의 채팅방이 있는지 확인
    // $all: 배열이 두 ID를 모두 포함하는 경우
    const existingRoom = await Room.findOne({
      participants: { $all: [myId, participantId] }
    }).populate('participants', 'name profileImage isOnline');

    if (existingRoom) {
      // 이미 있으면 기존 방 반환
      return res.json({ room: existingRoom });
    }

    // 없으면 새 채팅방 생성
    const newRoom = new Room({
      participants: [myId, participantId]
    });
    await newRoom.save();
    await newRoom.populate('participants', 'name profileImage isOnline');

    res.status(201).json({ room: newRoom });

  } catch (error) {
    console.error('채팅방 생성 오류:', error);
    res.status(500).json({ message: '채팅방 생성에 실패했어요.' });
  }
});

// ─────────────────────────────────────
// PATCH /api/users/profile - 프로필 수정
// ─────────────────────────────────────
// body: { name, statusMessage }
// 서현의 ProfilePage에서 저장 버튼 클릭 시 호출해요
router.patch('/profile', async (req, res) => {
  try {
    const { name, statusMessage } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ message: '이름을 입력해주세요.' })
    }

    // findByIdAndUpdate: 해당 ID의 문서를 찾아서 수정
    // { new: true }: 수정된 결과를 반환 (기본값은 수정 전 결과)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        name:          name.trim(),
        statusMessage: statusMessage ? statusMessage.trim() : ''
      },
      { new: true }
    ).select('-password')

    res.json({ user: updatedUser, message: '프로필이 수정됐어요.' })

  } catch (error) {
    res.status(500).json({ message: '프로필 수정에 실패했어요.' })
  }
})

module.exports = router;
