/**
 * 경기 기록 관련 HTTP API 라우트
 */
import express from 'express';
import {
  saveGameHistory,
  getGameHistory,
  getGameById,
  deleteGameHistory,
  deleteGameById,
} from '../database.js';

const router = express.Router();

/**
 * POST /api/game-history
 * 경기 기록 저장
 */
router.post('/', (req, res) => {
  try {
    const { guestId, roomId, winner, moves, players } = req.body;
    
    if (!guestId || !moves || moves.length === 0) {
      return res.status(400).json({ success: false, error: '필수 데이터가 없습니다.' });
    }
    
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const gameData = {
      id: gameId,
      guestId,
      roomId: roomId || null,
      winner: winner || null,
      moves: moves || [],
      players: players || [],
    };
    
    saveGameHistory(gameData);
    res.json({ 
      success: true, 
      gameId, 
      game: {
        id: gameId,
        guestId,
        roomId: roomId || null,
        winner: winner || null,
        moves: moves || [],
        players: players || [],
        timestamp: Date.now(),
      }
    });
  } catch (error) {
    console.error('경기 기록 저장 오류:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/game-history/:guestId
 * 경기 기록 조회 (게스트 ID별)
 */
router.get('/:guestId', (req, res) => {
  try {
    const { guestId } = req.params;
    const history = getGameHistory(guestId);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/game-history/:guestId/:gameId
 * 특정 경기 기록 조회
 */
router.get('/:guestId/:gameId', (req, res) => {
  try {
    const { guestId, gameId } = req.params;
    const game = getGameById(gameId, guestId);
    
    if (!game) {
      return res.status(404).json({ success: false, error: '경기 기록을 찾을 수 없습니다.' });
    }
    
    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/game-history/:guestId
 * 경기 기록 삭제 (게스트 ID별)
 */
router.delete('/:guestId', (req, res) => {
  try {
    const { guestId } = req.params;
    deleteGameHistory(guestId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/game-history/:guestId/:gameId
 * 특정 경기 기록 삭제
 */
router.delete('/:guestId/:gameId', (req, res) => {
  try {
    const { guestId, gameId } = req.params;
    deleteGameById(gameId, guestId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
