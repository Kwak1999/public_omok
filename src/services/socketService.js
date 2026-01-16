import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // 서버 연결
  connect(serverUrl = import.meta.env.VITE_SERVER_URL) {
    if (!serverUrl) {
      console.error('VITE_SERVER_URL 환경 변수가 설정되지 않았습니다.');
      throw new Error('서버 URL이 설정되지 않았습니다.');
    }
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('서버 연결됨:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('서버 연결 해제됨');
    });

    this.socket.on('connect_error', (error) => {
      console.error('연결 오류:', error);
    });

    return this.socket;
  }

  // 연결 해제
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // 방 생성
  createRoom(callback) {
    if (!this.socket) {
      console.error('소켓이 연결되지 않았습니다.');
      return;
    }

    this.socket.emit('createRoom');
    this.socket.once('roomCreated', callback);
  }

  // 방 참가
  joinRoom(roomId, callback) {
    if (!this.socket) {
      console.error('소켓이 연결되지 않았습니다.');
      return;
    }

    this.socket.emit('joinRoom', { roomId });
    this.socket.once('playerJoined', callback);
  }

  // 착수
  placeStone(roomId, row, col) {
    if (!this.socket) {
      console.error('소켓이 연결되지 않았습니다.');
      return;
    }

    this.socket.emit('placeStone', { roomId, row, col });
  }

  // 게임 리셋
  resetGame(roomId, callback) {
    if (!this.socket) {
      console.error('소켓이 연결되지 않았습니다.');
      if (callback) callback({ success: false, error: '소켓이 연결되지 않았습니다.' });
      return;
    }

    this.socket.emit('resetGame', { roomId }, callback);
  }

  // 이벤트 리스너 등록
  on(event, callback) {
    if (!this.socket) {
      console.error('소켓이 연결되지 않았습니다.');
      return;
    }

    this.socket.on(event, callback);
  }

  // 이벤트 리스너 제거
  off(event, callback) {
    if (!this.socket) {
      return;
    }

    this.socket.off(event, callback);
  }

  // 에러 리스너
  onError(callback) {
    this.on('error', callback);
  }

  // 착수 이벤트 리스너
  onStonePlaced(callback) {
    this.on('stonePlaced', callback);
  }

  // 게임 리셋 이벤트 리스너
  onGameReset(callback) {
    this.on('gameReset', callback);
  }

  // 플레이어 참가 이벤트 리스너
  onPlayerJoined(callback) {
    this.on('playerJoined', callback);
  }

  // 플레이어 나감 이벤트 리스너
  onPlayerLeft(callback) {
    this.on('playerLeft', callback);
  }

  // Ready 상태 토글
  toggleReady(roomId, callback) {
    if (!this.socket) {
      console.error('소켓이 연결되지 않았습니다.');
      if (callback) callback({ success: false, error: '소켓이 연결되지 않았습니다.' });
      return;
    }

    this.socket.emit('toggleReady', { roomId }, callback);
  }

  // 플레이어 Ready 상태 업데이트 이벤트 리스너
  onPlayerReadyUpdated(callback) {
    this.on('playerReadyUpdated', callback);
  }

  // 기권
  surrender(roomId, callback) {
    if (!this.socket) {
      console.error('소켓이 연결되지 않았습니다.');
      if (callback) callback({ success: false, error: '소켓이 연결되지 않았습니다.' });
      return;
    }

    this.socket.emit('surrender', { roomId }, callback);
  }

  getSocket() {
    return this.socket;
  }

  getIsConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// 싱글톤 인스턴스
const socketService = new SocketService();

export default socketService;
