// ========================================
// 📁 backend/models/Message.js - 메시지 DB 설계도 (기혁 담당)
// ========================================
// 채팅 메시지를 어떻게 저장할지 설계도를 만드는 파일이에요.
// 모든 채팅 메시지는 MongoDB의 'messages' 컬렉션에 저장돼요.

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({

  // 메시지 내용 (실제 채팅 텍스트)
  content: {
    type:     String,
    required: true,
    trim:     true
  },

  // 이 메시지를 보낸 사람 (User 문서의 ID를 참조)
  // 예: "64a1b2c3d4e5f6a7b8c9d0e1"
  // populate('sender', 'name profileImage') 하면 실제 사용자 정보로 바뀌어요
  sender: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',      // User 모델 참조
    required: true
  },

  // 이 메시지가 속한 채팅방 (Room 문서의 ID를 참조)
  room: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Room',      // Room 모델 참조
    required: true
  },

  // 읽음 여부 (상대방이 이 메시지를 읽었는지)
  // false: 안 읽음, true: 읽음
  isRead: {
    type:    Boolean,
    default: false
  },

  // 메시지 타입 (나중에 이미지, 파일 등 확장 가능)
  // enum: 이 세 가지 값만 허용해요 (다른 값은 에러)
  messageType: {
    type:    String,
    enum:    ['text', 'image', 'system'],
    default: 'text'
  }

}, {
  timestamps: true  // createdAt(보낸 시간), updatedAt 자동 추가
});

// --- 인덱스 설정 ---
// 인덱스: 자주 사용하는 검색 조건을 빠르게 처리하기 위한 설정
// 특정 채팅방의 메시지를 시간순으로 자주 찾으니까 인덱스를 걸어요
// 인덱스가 없으면 데이터가 많을 때 매우 느려질 수 있어요
messageSchema.index({ room: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
