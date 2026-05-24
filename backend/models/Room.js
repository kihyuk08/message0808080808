// ========================================
// 📁 backend/models/Room.js - 채팅방 DB 설계도 (기혁 담당)
// ========================================
// 채팅방(대화방)의 정보를 어떻게 저장할지 설계도를 만드는 파일이에요.
// 1:1 채팅이라면 방마다 2명의 참여자가 있어요.
// 서현이 만드는 RoomList 컴포넌트가 이 데이터를 화면에 보여줘요.

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({

  // 채팅방 참여자 목록 (User ID 배열)
  // 1:1 채팅: 항상 2명 [userId1, userId2]
  // 그룹 채팅으로 확장한다면 여러 명도 가능
  participants: [{
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',   // User 모델 참조
    required: true
  }],

  // 마지막 메시지 내용 (채팅방 목록에서 미리보기용)
  // 예: "야 오늘 어디서 만나?" → 채팅방 목록에 이 내용이 표시돼요
  lastMessage: {
    type:    String,
    default: ''
  },

  // 마지막 메시지를 보낸 시간 (채팅방 목록을 최신순으로 정렬하는 데 사용)
  lastMessageAt: {
    type:    Date,
    default: Date.now
  },

  // 각 참여자별 읽지 않은 메시지 수
  // Map(딕셔너리) 형태로 저장: { "userId1": 3, "userId2": 0 }
  // 3 = userId1이 읽지 않은 메시지가 3개
  unreadCount: {
    type:    Map,
    of:      Number,  // Map의 값은 숫자
    default: {}
  }

}, {
  timestamps: true
});

// 내가 참여한 채팅방을 빠르게 검색하기 위한 인덱스
// 서현의 RoomList에서 자주 쓰이는 쿼리예요
roomSchema.index({ participants: 1, lastMessageAt: -1 });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
