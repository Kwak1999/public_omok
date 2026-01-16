import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import useMultiplayerStore from '../stores/useMultiplayerStore';
import { isGuestLoggedIn } from '../utils/guestAuth';

const RoomList = () => {
  const navigate = useNavigate();
  const { connect, isConnected } = useMultiplayerStore();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomTitle, setRoomTitle] = useState('');

  useEffect(() => {
    // 게스트 로그인 확인
    if (!isGuestLoggedIn()) {
      navigate('/');
      return;
    }

    // Socket 연결
    if (!isConnected) {
      const serverUrl = import.meta.env.VITE_SERVER_URL;
      if (serverUrl) {
        connect(serverUrl);
      } else {
        setLoading(false);
        return;
      }
    }

    // 공개방 리스트 가져오기
    const fetchRooms = async () => {
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        if (!serverUrl) {
          console.error('서버 URL이 설정되지 않았습니다.');
          setLoading(false);
          return;
        }
        const response = await fetch(`${serverUrl}/api/rooms`);
        const data = await response.json();
        if (data.success) {
          setRooms(data.rooms);
        }
      } catch (error) {
        console.error('방 리스트 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Socket 이벤트 리스너
    const socket = socketService.getSocket();
    if (socket) {
      socket.on('publicRoomsUpdated', (data) => {
        setRooms(data.rooms);
      });
    }

    return () => {
      if (socket) {
        socket.off('publicRoomsUpdated');
      }
    };
  }, [isConnected, connect, navigate]);

  const handleCreateRoom = () => {
    setShowCreateModal(true);
  };

  const handleConfirmCreate = () => {
    const socket = socketService.getSocket();
    if (!socket) {
      alert('서버에 연결되지 않았습니다.');
      return;
    }

    const title = roomTitle.trim() || null;
    
    socket.emit('createPublicRoom', { title }, (response) => {
      if (response.success && response.room) {
        setShowCreateModal(false);
        setRoomTitle('');
        // 방 생성 후 약간의 지연을 두고 이동 (DB 트랜잭션 완료 대기)
        setTimeout(() => {
          navigate(`/room/${response.room.id}`);
        }, 100);
      } else {
        alert('방 생성 실패: ' + (response.error || '알 수 없는 오류'));
      }
    });
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setRoomTitle('');
  };

  const handleJoinRoom = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-neutral-700 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-neutral-700 dark:text-gray-300">
              오목 공개방
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
              >
                홈으로
              </button>
              <button
                onClick={handleCreateRoom}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-semibold"
              >
                방 만들기
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                현재 생성된 방이 없습니다.
              </div>
              <button
                onClick={handleCreateRoom}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-semibold"
              >
                첫 방 만들기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg border border-gray-200 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-600 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {room.playerCount}/2
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-700 dark:text-gray-300">
                        {room.title || `방 ID: ${room.id.substring(0, 8)}...`}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        플레이어: {room.playerCount}명
                        {room.title && <span className="ml-2 text-xs">({room.id.substring(0, 8)}...)</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={room.playerCount > 2}
                    className={`px-6 py-2 rounded-md font-semibold transition ${
                      room.playerCount > 2
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                    }`}
                  >
                    {room.playerCount > 2 ? '가득 참' : '입장'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 방 만들기 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-2xl font-bold text-neutral-700 dark:text-gray-300 mb-4">
              방 만들기
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                방 제목 (선택사항)
              </label>
              <input
                type="text"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmCreate();
                  }
                }}
                placeholder="방 제목을 입력하세요"
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-md dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                제목을 입력하지 않으면 방 ID가 표시됩니다.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelCreate}
                className="px-4 py-2 bg-gray-300 text-gray-700 dark:bg-neutral-600 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-neutral-500 transition"
              >
                취소
              </button>
              <button
                onClick={handleConfirmCreate}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-semibold"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
