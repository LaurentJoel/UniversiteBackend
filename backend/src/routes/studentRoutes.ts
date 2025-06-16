import express from 'express';
import { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent, getStudentRemainingRent } from '../controllers/studentController';
import { authenticateJWT, authorizeRole } from '../middleware/authMiddleware';
import { validateStudent } from '../utils/validation';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

router.get('/', authenticateJWT, getAllStudents);
router.get('/:id', authenticateJWT, getStudentById);
router.get('/:id/remaining-rent', authenticateJWT, getStudentRemainingRent);
router.post('/', authenticateJWT, authorizeRole(['admin']), validateStudent, validateRequest, createStudent);
router.put('/:id', authenticateJWT, authorizeRole(['admin']), validateStudent, validateRequest, updateStudent);
router.delete('/:id', authenticateJWT, authorizeRole(['admin']), deleteStudent);
router.get('/matricule/:matricule', authenticateJWT, async (req, res) => {
  // Implement get student by matricule
  // ...existing code...
});

export default router;
