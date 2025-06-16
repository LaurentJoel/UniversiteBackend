import { Request, Response } from 'express';
import * as PaymentModel from '../models/Payment';

export async function getAllPayments(req: Request, res: Response) {
  const payments = await PaymentModel.getAllPayments();
  res.json(payments);
}

export async function getPaymentsByStudentId(req: Request, res: Response) {
  const studentId = Number(req.params.studentId);
  const payments = await PaymentModel.getPaymentsByStudentId(studentId);
  res.json(payments);
}

export async function getPaymentById(req: Request, res: Response) {
  const payment = await PaymentModel.getPaymentById(Number(req.params.id));
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json(payment);
}

export async function createPayment(req: Request, res: Response) {
  const payment = await PaymentModel.createPayment(req.body);
  res.status(201).json(payment);
}

export async function updatePayment(req: Request, res: Response) {
  const updated = await PaymentModel.updatePayment(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Payment not found' });
  res.json(updated);
}

export async function deletePayment(req: Request, res: Response) {
  await PaymentModel.deletePayment(Number(req.params.id));
  res.status(204).send();
}
