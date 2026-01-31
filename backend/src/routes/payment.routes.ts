import { Router } from 'express';
import { createPaymentIntent } from '../controllers/payment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create-payment-intent', authenticateToken, createPaymentIntent);

export default router;
