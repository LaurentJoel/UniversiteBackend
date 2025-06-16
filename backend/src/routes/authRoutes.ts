import express from 'express';
import { login, getProfile, updateProfile } from '../controllers/authController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validateLogin } from '../utils/validation';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

router.post('/login', validateLogin, validateRequest, login);
router.get('/profile', authenticateJWT, getProfile);
router.get('/me', authenticateJWT, getProfile);
router.put('/me', authenticateJWT, updateProfile);
router.post('/logout', authenticateJWT, (req, res) => {
  // For stateless JWT, just respond OK and let frontend clear token
  res.json({ success: true });
});

export default router;
