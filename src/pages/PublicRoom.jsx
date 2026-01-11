import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '../components/omok/Board';
import socketService from '../services/socketService';
import useMultiplayerStore from '../stores/useMultiplayerStore';
import useGameStore from '../stores/useGameStore';

const PublicRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { connect, isConnected } = useMultiplayerStore();
  const { syncMultiplayerState } = useGameStore();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    // 방 참가
    socket.emit('joinPublicRoom', { roomId }, (response) => {
      if (response.success) {
        setRoom(response.room);
        // 멀티플레이어 모드 설정
        useMultiplayerStore.setState({
          isMultiplayer: true,
          roomId: response.room.id,
          myPlayer: response.room.players.find(p => p.socketId === socket.id)?.playerType || null,
          players: response.room.players,
        });
        setLoading(false);
      } else {
        setError(response.error || '방 참가 실패');
        setLoading(false);
      }
    });

    // 방 업데이트 이벤트
    socket.on('roomUpdated', (data) => {
      if (data.success) {
        setRoom(data.room);
        // 멀티플레이어 상태 업데이트
        const mySocketId = socket.id;
        const currentState = useMultiplayerStore.getState();
        // 게임이 끝났을 때(gameEndedPlayer가 있으면)는 myPlayer를 업데이트하지 않음
        const newMyPlayer = data.room.players.find(p => p.socketId === mySocketId)?.playerType || null;
        useMultiplayerStore.setState({
          myPlayer: currentState.gameEndedPlayer ? currentState.myPlayer : newMyPlayer,
          players: data.room.players,
        });
      }
    });

    // 게임 시작 이벤트
    socket.on('gameStarted', (data) => {
      if (data.success) {
        setRoom(data.room);
        // 게임 시작 시 gameEndedPlayer 초기화
        useMultiplayerStore.setState({ gameEndedPlayer: null });
        syncMultiplayerState(
          data.board,
          data.currentPlayer,
          null
        );
      }
    });

    // 방 삭제 이벤트
    socket.on('roomDeleted', () => {
      alert('방이 삭제되었습니다.');
      navigate('/rooms');
    });

    return () => {
      socket.off('roomUpdated');
      socket.off('gameStarted');
      socket.off('roomDeleted');
    };
  }, [roomId, isConnected, connect, navigate, syncMultiplayerState]);

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
    <div className="min-h-screen bg-slate-100 dark:bg-neutral-700">
      {/* 방 정보 및 컨트롤 */}
      <div className="bg-white dark:bg-neutral-800 shadow-md p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => !isPlaying && navigate('/rooms')}
              disabled={isPlaying}
              className={`px-4 py-2 rounded-md transition ${
                isPlaying
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
              title={isPlaying ? '게임이 진행 중입니다' : ''}
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
