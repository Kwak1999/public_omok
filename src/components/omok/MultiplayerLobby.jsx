import React, { useState, useEffect } from 'react';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import socketService from '../../services/socketService';

const MultiplayerLobby = ({ onClose }) => {
  const {
    isConnected,
    roomId,
    myPlayer,
    players,
    connect,
    createRoom,
    joinRoom,
    disconnect,
  } = useMultiplayerStore();

  const [serverUrl, setServerUrl] = useState(
    import.meta.env.VITE_SERVER_URL || ''
  );
  const [inputRoomId, setInputRoomId] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 서버 연결
    if (!isConnected) {
      connect(serverUrl);
    }

    return () => {
      // 컴포넌트 언마운트 시 정리 (필요시)
    };
  }, []);

  const handleCreateRoom = () => {
    createRoom((data) => {
      setShowCreateRoom(true);
      // 개발 모드에서만 로그 출력
      if (import.meta.env.DEV) {
        console.log('방 생성됨');
      }
    });
  };

  const handleJoinRoom = () => {
    if (!inputRoomId.trim()) {
      alert('방 ID를 입력해주세요.');
      return;
    }
    joinRoom(inputRoomId.trim(), (data) => {
      setShowJoinRoom(true);
      // 개발 모드에서만 로그 출력
      if (import.meta.env.DEV) {
        console.log('방 참가됨');
      }
    });
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 sm:p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-700 dark:text-gray-300">
            멀티플레이어
          </h2>
          <button
            onClick={handleDisconnect}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl sm:text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 연결 상태 */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-neutral-600 dark:text-gray-400">
              {isConnected ? '서버 연결됨' : '서버 연결 안 됨'}
            </span>
          </div>
        </div>

        {/* 방이 생성/참가된 경우 */}
        {roomId ? (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                방 ID (다른 플레이어에게 공유하세요)
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={roomId}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white dark:bg-neutral-700 border border-blue-300 dark:border-blue-600 rounded text-sm font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomId);
                    alert('방 ID가 복사되었습니다!');
                  }}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  복사
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-neutral-700/50 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2 text-neutral-700 dark:text-gray-300">
                플레이어
              </p>
              <div className="space-y-2">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span
                      className={`w-4 h-4 rounded-full ${
                        player.player === 'black' ? 'bg-black' : 'bg-white border-2 border-gray-400'
                      }`}
                    />
                    <span className="text-neutral-600 dark:text-gray-400">
                      {player.player === 'black' ? '흑돌' : '백돌'}
                      {player.socketId === socketService?.getSocket()?.id && ' (나)'}
                    </span>
                  </div>
                ))}
                {players.length < 2 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    상대방을 기다리는 중...
                  </p>
                )}
              </div>
            </div>

            {players.length === 2 && (
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition font-semibold"
              >
                게임 시작
              </button>
            )}
          </div>
        ) : (
          /* 방 생성/참가 선택 */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={handleCreateRoom}
                disabled={!isConnected}
                className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-md font-semibold transition ${
                  isConnected
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                방 만들기
              </button>
              <button
                onClick={() => setShowJoinRoom(true)}
                disabled={!isConnected}
                className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-md font-semibold transition ${
                  isConnected
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                방 참가
              </button>
            </div>

            {showJoinRoom && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="방 ID를 입력하세요"
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md dark:bg-neutral-700 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleJoinRoom}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    참가
                  </button>
                  <button
                    onClick={() => {
                      setShowJoinRoom(false);
                      setInputRoomId('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerLobby;
