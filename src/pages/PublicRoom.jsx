import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '../components/omok/Board';
import socketService from '../services/socketService';
import useMultiplayerStore from '../stores/useMultiplayerStore';
import useGameStore from '../stores/useGameStore';
import { isGuestLoggedIn, getGuestId } from '../utils/guestAuth';
import { saveGameHistory } from '../utils/gameHistory';

const PublicRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { connect, isConnected } = useMultiplayerStore();
  const { syncMultiplayerState } = useGameStore();
  const { winner, moves, board } = useGameStore();
  const { players } = useMultiplayerStore();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLeftRoom, setHasLeftRoom] = useState(false); // 명시적으로 나갔는지 추적
  const hasJoinedRoomRef = useRef(false); // 실제로 방에 참가했는지 추적 (ref 사용으로 동기적 확인)
  const hasLeftRoomRef = useRef(false); // 나가기 상태를 ref로도 추적 (cleanup에서 동기적 확인)

  useEffect(() => {
    // 게스트 로그인 확인
    if (!isGuestLoggedIn()) {
      setError('게스트 로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    // Socket 연결
    if (!isConnected) {
      connect('http://localhost:3001');
    }

    const socket = socketService.getSocket();
    if (!socket) {
      setError('서버에 연결되지 않았습니다.');
      setLoading(false);
      return;
    }

    // Socket 연결 대기 후 방 참가
    const joinRoom = () => {
      // 이미 나가는 중이면 참가하지 않음
      if (hasLeftRoomRef.current) {
        setLoading(false);
        return;
      }
      
      socket.emit('joinPublicRoom', { roomId }, (response) => {
        // 응답 받기 전에 나가기 상태가 변경되었으면 무시
        if (hasLeftRoomRef.current) {
          setLoading(false);
          return;
        }
        
        if (response && response.success) {
          setRoom(response.room);
          hasJoinedRoomRef.current = true; // 방 참가 성공 표시 (ref로 동기적 설정)
          // 이전 게임 결과 초기화
          useGameStore.getState().resetGame();
          // 멀티플레이어 모드 설정
          useMultiplayerStore.setState({
            isMultiplayer: true,
            roomId: response.room.id,
            roomStatus: response.room.status, // 공개방 상태 저장
            myPlayer: response.room.players.find(p => p.socketId === socket.id)?.playerType || null,
            players: response.room.players,
            gameEndedPlayer: null, // 게임 종료 상태도 초기화
          });
          setLoading(false);
        } else {
          setError(response?.error || '방 참가 실패');
          setLoading(false);
        }
      });
    };

    // Socket이 연결되어 있으면 바로 참가, 아니면 연결 대기
    if (socket.connected) {
      joinRoom();
    } else {
      socket.once('connect', () => {
        joinRoom();
      });
    }

    // 방 업데이트 이벤트
    socket.on('roomUpdated', (data) => {
      if (data.success) {
        // 이미 나간 플레이어는 업데이트 무시
        if (hasLeftRoom || !hasJoinedRoomRef.current) {
          return;
        }
        
        // 자신이 방에 있는지 확인 (나가는 중이면 무시)
        const mySocketId = socket.id;
        const isStillInRoom = data.room.players.some(p => p.socketId === mySocketId);
        if (!isStillInRoom) {
          // 자신이 방에 없으면 무시 (다른 플레이어가 나갔을 때의 업데이트)
          return;
        }
        
        setRoom(data.room);
        // 멀티플레이어 상태 업데이트
        const currentState = useMultiplayerStore.getState();
        // 게임이 끝났을 때(gameEndedPlayer가 있으면)는 myPlayer를 업데이트하지 않음
        const newMyPlayer = data.room.players.find(p => p.socketId === mySocketId)?.playerType || null;
        useMultiplayerStore.setState({
          roomStatus: data.room.status, // 공개방 상태 업데이트
          myPlayer: currentState.gameEndedPlayer ? currentState.myPlayer : newMyPlayer,
          players: data.room.players,
        });
      }
    });

    // 게임 시작 이벤트
    socket.on('gameStarted', (data) => {
      if (data.success) {
        setRoom(data.room);
        // 게임 시작 시 gameEndedPlayer 초기화 및 roomStatus 업데이트
        useMultiplayerStore.setState({ 
          gameEndedPlayer: null,
          roomStatus: data.room.status, // 'playing' 상태로 업데이트
        });
        // 게임 시작 시 moves를 빈 배열로 초기화
        syncMultiplayerState(
          data.board,
          data.currentPlayer,
          null,
          [] // 게임 시작 시 moves 초기화
        );
      }
    });

    // 방 삭제 이벤트
    socket.on('roomDeleted', () => {
      alert('방이 삭제되었습니다.');
      navigate('/rooms');
    });

    return () => {
      // 컴포넌트 언마운트 시 (Navbar 링크 클릭 등으로 페이지 이탈 시) 방에서 나가기
      // 실제로 방에 참가했고, 명시적으로 나가지 않았을 경우에만 나가기
      // ref를 사용하여 동기적으로 확인 (상태 업데이트는 비동기이므로)
      const currentSocket = socketService.getSocket();
      
      if (!hasLeftRoomRef.current && hasJoinedRoomRef.current && currentSocket) {
        // 나가기 상태를 즉시 설정하여 중복 호출 방지
        hasLeftRoomRef.current = true;
        hasJoinedRoomRef.current = false;
        
        // 서버에 나가기 이벤트 전송 (콜백 없이)
        currentSocket.emit('leavePublicRoom', { roomId }, () => {
          // 콜백은 무시 (이미 페이지를 떠나는 중)
        });
        
        // 멀티플레이어 상태 초기화
        useMultiplayerStore.setState({
          isMultiplayer: false,
          roomId: null,
          roomStatus: null,
          myPlayer: null,
          players: [],
        });
      }
      
      socket.off('roomUpdated');
      socket.off('gameStarted');
      socket.off('roomDeleted');
    };
  }, [roomId, isConnected, connect, navigate, syncMultiplayerState, hasLeftRoom]);

  // 자동 저장은 제거하고 수동 저장 버튼 사용

  const handleToggleReady = () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('toggleReady', { roomId }, (response) => {
      if (!response.success) {
        alert('Ready 상태 변경 실패: ' + response.error);
      }
    });
  };

  const handleStartGame = () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('startGame', { roomId }, (response) => {
      if (!response.success) {
        alert('게임 시작 실패: ' + response.error);
      }
    });
  };

  const handleLeaveRoom = () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // 이미 나가는 중이면 무시
    if (hasLeftRoom) return;

    if (room?.status === 'playing') {
      const shouldLeave = window.confirm('게임 진행 중입니다. 방에서 나가시겠습니까?');
      if (!shouldLeave) return;
    }

    // 명시적으로 나간 것으로 표시 (cleanup에서 중복 호출 방지)
    setHasLeftRoom(true);
    hasLeftRoomRef.current = true; // ref로도 표시 (동기적 확인)
    hasJoinedRoomRef.current = false; // 참가 상태도 초기화

    // 먼저 상태 초기화하여 Navbar 활성화 및 이벤트 리스너 무시
    useMultiplayerStore.setState({
      isMultiplayer: false,
      roomId: null,
      roomStatus: null,
      myPlayer: null,
      players: [],
    });

    // 서버에 나가기 이벤트 전송 (서버 응답을 기다림)
    socket.emit('leavePublicRoom', { roomId }, (response) => {
      if (!response?.success) {
        alert('방 나가기 실패: ' + (response?.error || '알 수 없는 오류'));
        setHasLeftRoom(false); // 실패 시 플래그 초기화
        hasLeftRoomRef.current = false; // ref도 초기화
        hasJoinedRoomRef.current = true; // 참가 상태 복원
        // 실패 시 멀티플레이어 상태 복원
        useMultiplayerStore.setState({
          isMultiplayer: true,
          roomId: roomId,
          roomStatus: room?.status || null,
          myPlayer: room?.players?.find(p => p.socketId === socket.id)?.playerType || null,
          players: room?.players || [],
        });
        return;
      }
      // 성공 시 페이지 이동
      navigate('/rooms');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-neutral-700 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-neutral-700 flex items-center justify-center">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 max-w-md">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={() => navigate('/rooms')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            방 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  const socket = socketService.getSocket();
  const mySocketId = socket?.id;
  const isHost = room.hostId === mySocketId;
  const myPlayer = room.players.find(p => p.socketId === mySocketId);
  // 참가자(유저)가 Ready 상태인지 확인 (방장이 아닌 플레이어)
  const guestPlayer = room.players.find(p => p.socketId !== room.hostId);
  const guestReady = guestPlayer?.isReady || false;
  const allReady = room.players.length === 2 && room.players.every(p => p.isReady);
  const isPlaying = room.status === 'playing';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-neutral-700 pt-20">
      {/* 방 정보 및 컨트롤 */}
      <div className="bg-white dark:bg-neutral-800 shadow-md p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 rounded-md transition bg-gray-500 text-white hover:bg-gray-600"
            >
              ← 방 목록
            </button>
            <div>
              <div className="font-semibold text-neutral-700 dark:text-gray-300">
                방 ID: {room.id.substring(0, 12)}...
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                플레이어: {room.players.length}/2
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 플레이어 상태 */}
            <div className="flex gap-2">
              {room.players.map((player, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-md text-sm ${
                    player.socketId === mySocketId
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {player.playerType === 'black' ? '⚫ 흑돌' : '⚪ 백돌'}
                  {player.isReady && ' ✓'}
                  {player.socketId === mySocketId && ' (나)'}
                </div>
              ))}
            </div>
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 rounded-md transition bg-red-500 text-white hover:bg-red-600"
            >
              나가기
            </button>

          </div>
        </div>
      </div>

      {/* 게임 보드 - 2명이 들어오면 항상 표시 */}
      {room.players.length === 2 ? (
        <Board 
          isPublicRoom={true}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
          roomData={room}
        />
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              상대방을 기다리는 중... ({room.players.length}/2)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicRoom;
