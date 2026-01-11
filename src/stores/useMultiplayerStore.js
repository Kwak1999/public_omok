import { create } from 'zustand';
import socketService from '../services/socketService';
import useGameStore from './useGameStore';

const useMultiplayerStore = create((set, get) => {
  // 게임 스토어와 동기화하는 헬퍼 함수
  const syncGameStore = (board, currentPlayer, winner) => {
    useGameStore.getState().syncMultiplayerState(board, currentPlayer, winner);
  };

  return {
    // 멀티플레이어 상태
    isMultiplayer: false,
    roomId: null,
    myPlayer: null, // 'black' 또는 'white'
    gameEndedPlayer: null, // 게임이 끝났을 때의 내 플레이어 색 (게임 리셋 전까지 유지)
    players: [], // [{ id, socketId, player }]
    isConnected: false,

    // Socket 연결
    connect: (serverUrl) => {
      const socket = socketService.connect(serverUrl);

      socketService.onStonePlaced((data) => {
        const { board, currentPlayer, winner } = data;
        syncGameStore(board, currentPlayer, winner);
        
        // 게임이 끝났을 때 현재 플레이어 색을 저장 (게임 리셋 전까지 유지)
        if (winner && !get().gameEndedPlayer) {
          const currentMyPlayer = get().myPlayer;
          set({ gameEndedPlayer: currentMyPlayer });
        }
      });

      socketService.onGameReset((data) => {
        const { board, currentPlayer, winner, players } = data;
        
        // 플레이어 포지션이 교체되었으므로 업데이트
        if (players) {
          const myPlayer = players.find(
            (p) => p.socketId === socketService.getSocket().id
          )?.player || null;
          
          set({ 
            players,
            myPlayer, // 교체된 내 플레이어 포지션 업데이트
            gameEndedPlayer: null, // 게임 리셋 시 초기화
          });
        }
        
        syncGameStore(board, currentPlayer, winner);
      });

      socketService.onPlayerJoined((data) => {
        const { players, board, currentPlayer } = data;
        set({ players });
        syncGameStore(board, currentPlayer, null);
      });

      socketService.onPlayerLeft((data) => {
        set({ players: data.players });
      });

      socketService.onPlayerReadyUpdated((data) => {
        set({ players: data.players });
      });

      socketService.onError((error) => {
        console.error('Socket 오류:', error);
      });

      // 기권 이벤트 리스너 (기권 시에도 gameEndedPlayer 설정)
      socket.on('stonePlaced', (data) => {
        const { winner } = data;
        if (winner && !get().gameEndedPlayer) {
          const currentMyPlayer = get().myPlayer;
          set({ gameEndedPlayer: currentMyPlayer });
        }
      });

      socket.on('connect', () => {
        set({ isConnected: true });
      });

      socket.on('disconnect', () => {
        set({ isConnected: false });
      });

      set({ isConnected: socket.connected });
    },

    // 방 생성
    createRoom: (callback) => {
      socketService.createRoom((data) => {
        const { roomId, player } = data;
        set({
          isMultiplayer: true,
          roomId,
          myPlayer: player,
          players: [{ id: socketService.getSocket().id, player }],
        });
        if (callback) callback(data);
      });
    },

    // 방 참가
    joinRoom: (roomId, callback) => {
      socketService.joinRoom(roomId, (data) => {
        const { players } = data;
        const myPlayer =
          players.find((p) => p.socketId === socketService.getSocket().id)?.player ||
          null;

        set({
          isMultiplayer: true,
          roomId,
          myPlayer,
          players,
          board: data.board,
          currentPlayer: data.currentPlayer,
        });
        if (callback) callback(data);
      });
    },

    // 착수 (서버로 전송)
    placeStone: (row, col) => {
      const { roomId } = get();
      if (roomId) socketService.placeStone(roomId, row, col);
    },

    // 게임 리셋 (서버로 전송)
    resetGame: (callback) => {
      const { roomId } = get();
      if (roomId) {
        socketService.resetGame(roomId, callback);
      } else if (callback) {
        callback({ success: false, error: '방 ID가 없습니다.' });
      }
    },

    // Ready 상태 토글
    toggleReady: (callback) => {
      const { roomId } = get();
      if (roomId) {
        socketService.toggleReady(roomId, (response) => {
          if (response.success && response.players) {
            set({ players: response.players });
          }
          if (callback) callback(response);
        });
      } else if (callback) {
        callback({ success: false, error: '방 ID가 없습니다.' });
      }
    },

    // 기권
    surrender: (callback) => {
      const { roomId } = get();
      if (roomId) {
        socketService.surrender(roomId, (response) => {
          if (callback) callback(response);
        });
      } else if (callback) {
        callback({ success: false, error: '방 ID가 없습니다.' });
      }
    },

    // 멀티플레이어 종료
    disconnect: () => {
      socketService.disconnect();
      set({
        isMultiplayer: false,
        roomId: null,
        myPlayer: null,
        gameEndedPlayer: null,
        players: [],
        isConnected: false,
      });
    },
  };
});

export default useMultiplayerStore;
