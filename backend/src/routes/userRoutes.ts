import express from 'express';
import { getAllUsers, getUserById, updateUser } from '../controllers/userController';
import { authenticateJWT, authorizeRole } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticateJWT, authorizeRole(['admin']), getAllUsers);
router.get('/:id', authenticateJWT, getUserById);
router.put('/:id', authenticateJWT, updateUser);

export default router;
