import express from 'express';
import { getAllPayments, getPaymentById, getPaymentsByStudentId, createPayment, updatePayment, deletePayment } from '../controllers/paymentController';
import { authenticateJWT, authorizeRole } from '../middleware/authMiddleware';
import { validatePayment } from '../utils/validation';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

router.get('/', authenticateJWT, getAllPayments);
router.get('/student/:studentId', authenticateJWT, getPaymentsByStudentId);
router.get('/:id', authenticateJWT, getPaymentById);
router.post('/', authenticateJWT, authorizeRole(['admin']), validatePayment, validateRequest, createPayment);
router.put('/:id', authenticateJWT, authorizeRole(['admin']), validatePayment, validateRequest, updatePayment);
router.delete('/:id', authenticateJWT, authorizeRole(['admin']), deletePayment);

export default router;
