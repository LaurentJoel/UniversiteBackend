import express from 'express';
import { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom } from '../controllers/roomController';
import { authenticateJWT, authorizeRole } from '../middleware/authMiddleware';
import { validateRoom } from '../utils/validation';
import { validateRequest } from '../middleware/validateRequest';
import * as RoomModel from '../models/Room'; // Import RoomModel

const router = express.Router();

router.get('/', authenticateJWT, getAllRooms);
router.get('/:id', authenticateJWT, getRoomById);
router.post('/', authenticateJWT, authorizeRole(['admin']), validateRoom, validateRequest, createRoom);
router.put('/:id', authenticateJWT, authorizeRole(['admin']), validateRoom, validateRequest, updateRoom);
router.delete('/:id', authenticateJWT, authorizeRole(['admin']), deleteRoom);
router.get('/status/:status', authenticateJWT, async (req, res) => {
  const { status } = req.params;
  const rooms = await RoomModel.getAllRooms();
  const filtered = rooms.filter((room: any) => room.status === status);
  res.json(filtered);
});
router.get('/floor/:floor', authenticateJWT, async (req, res) => {
  const { floor } = req.params;
  const rooms = await RoomModel.getAllRooms();
  const filtered = rooms.filter((room: any) => String(room.floor) === String(floor));
  res.json(filtered);
});

export default router;
