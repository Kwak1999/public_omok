/**
 * 공개방 관련 HTTP API 라우트
 */
import express from 'express';
import { getPublicRooms } from '../database.js';

const router = express.Router();

/**
 * GET /api/rooms
 * 공개방 리스트 조회
 */
router.get('/', (req, res) => {
  try {
    const rooms = getPublicRooms();
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
