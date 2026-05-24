// ========================================
// 📁 backend/socket/index.js - Socket.IO 이벤트 핸들러 (지후 담당)
// ========================================
// 실시간 채팅 기능의 핵심 파일이에요.
//
// Socket.IO vs REST API (Axios) 차이:
//  - REST API: "요청 → 응답" (전화하는 것처럼, 요청할 때만 연결)
//  - Socket.IO: 항상 연결된 상태 (메신저처럼 언제든 메시지 송수신 가능)
//
// 메시지 흐름:
//  사용자A가 메시지 입력 → emit('sendMessage') → 서버 → io.to(방).emit('receiveMessage') → 같은 방 모두에게 전달
//
// 이벤트 목록:
//  connection   : 사용자가 소켓 서버에 접속했을 때
//  userOnline   : 사용자가 자신의 ID를 등록할 때 (온라인 상태 표시용)
//  joinRoom     : 특정 채팅방에 입장할 때
//  sendMessage  : 메시지를 보낼 때
//  readMessage  : 메시지를 읽었음을 알릴 때
//  disconnect   : 연결이 끊겼을 때

const Message = require('../models/Message');
const Room    = require('../models/Room');
const User    = require('../models/User');

// io: app.js에서 생성한 Socket.IO 서버 객체
const setupSocket = (io) => {

  // "connection" 이벤트: 새 클라이언트가 소켓 연결했을 때 자동 실행
  io.on('connection', (socket) => {
    console.log(`🔌 소켓 연결됨: ${socket.id}`);

    // ─────────────────────────────────────
    // 사용자 온라인 상태 등록
    // 프론트에서: socket.emit('userOnline', userId)
    // ─────────────────────────────────────
    socket.on('userOnline', async (userId) => {
      // socket 객체에 userId를 저장해두면 disconnect 시 사용할 수 있어요
      socket.userId = userId;

      // DB에 온라인 상태 저장
      await User.findByIdAndUpdate(userId, { isOnline: true }).catch(() => {});

      // 모든 연결된 사용자에게 이 사람이 온라인이 됐다고 알림
      // io.emit(): 연결된 모든 소켓에게 전송
      io.emit('userStatusChange', { userId, isOnline: true });
    });

    // ─────────────────────────────────────
    // 채팅방 입장
    // 프론트에서: socket.emit('joinRoom', roomId)
    // ─────────────────────────────────────
    socket.on('joinRoom', (roomId) => {
      // socket.join(roomId): 이 소켓을 roomId 방에 추가
      // 같은 방에 있는 소켓들끼리만 메시지를 주고받을 수 있어요
      socket.join(roomId);
      console.log(`방 입장: ${socket.id} → 방 ${roomId}`);
    });

    // ─────────────────────────────────────
    // 메시지 보내기
    // 프론트에서: socket.emit('sendMessage', { content, roomId, senderId, senderName, senderImage })
    // ─────────────────────────────────────
    socket.on('sendMessage', async (data) => {
      try {
        const { content, roomId, senderId, senderName, senderImage } = data;

        // DB에 메시지 저장 (소켓으로 전송만 하면 새로고침 시 사라지니까!)
        const message = new Message({
          content,
          sender: senderId,
          room:   roomId
        });
        await message.save();

        // 채팅방의 마지막 메시지 업데이트
        await Room.findByIdAndUpdate(roomId, {
          lastMessage:   content,
          lastMessageAt: new Date()
        });

        // 같은 방의 모든 사용자에게 새 메시지 전송
        // io.to(roomId).emit(): 특정 방의 모든 소켓에게 이벤트 전송
        // socket.to(roomId).emit() 과 달리 보낸 사람 자신도 포함해요
        io.to(roomId).emit('receiveMessage', {
          _id:     message._id,
          content,
          sender: {
            _id:          senderId,
            name:         senderName,
            profileImage: senderImage
          },
          room:      roomId,
          createdAt: message.createdAt,
          isRead:    false
        });

      } catch (error) {
        console.error('소켓 메시지 전송 오류:', error);
        // 오류가 생긴 클라이언트에게만 에러 알림
        socket.emit('socketError', { message: '메시지 전송에 실패했어요.' });
      }
    });

    // ─────────────────────────────────────
    // 메시지 읽음 처리
    // 프론트에서: socket.emit('readMessage', { roomId, userId })
    // ─────────────────────────────────────
    socket.on('readMessage', async ({ roomId, userId }) => {
      // 나를 제외한 다른 사람들이 보낸 메시지를 읽음 처리
      await Message.updateMany(
        { room: roomId, sender: { $ne: userId }, isRead: false },
        { isRead: true }
      ).catch(() => {});

      // 같은 방의 다른 사람들에게 읽음 알림
      // socket.to(roomId): 나 자신을 제외한 같은 방의 소켓들에게 전송
      socket.to(roomId).emit('messageRead', { roomId, userId });
    });

    // ─────────────────────────────────────
    // 연결 끊김
    // 브라우저를 닫거나 인터넷이 끊기면 자동 실행
    // ─────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`❌ 소켓 연결 끊김: ${socket.id}`);

      if (socket.userId) {
        // DB에 오프라인 상태 저장
        await User.findByIdAndUpdate(socket.userId, { isOnline: false }).catch(() => {});

        // 모든 사용자에게 오프라인 알림
        io.emit('userStatusChange', { userId: socket.userId, isOnline: false });
      }
    });
  });
};

module.exports = setupSocket;
