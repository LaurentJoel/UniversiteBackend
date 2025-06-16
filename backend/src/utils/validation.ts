import { body, ValidationChain } from 'express-validator';

export const validateRoom: ValidationChain[] = [
  body('number').notEmpty().withMessage('Room number is required'),
  body('type').notEmpty().withMessage('Room type is required'),
  body('status').isIn(['available', 'occupied', 'complet']).withMessage('Invalid status'),
  body('maxOccupancy').isInt({ min: 1 }).withMessage('Max occupancy must be at least 1'),
];

export const validateStudent: ValidationChain[] = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

export const validatePayment: ValidationChain[] = [
  body('studentId').isInt().withMessage('Student ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('dueDate').notEmpty().withMessage('Due date is required'),
  body('status').isIn(['paid', 'pending', 'overdue', 'cancelled']).withMessage('Invalid payment status'),
];

export const validateLogin: ValidationChain[] = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
