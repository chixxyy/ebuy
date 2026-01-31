import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as PaymentService from '../services/payment.service';

const prisma = new PrismaClient();

export const createPaymentIntent = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        // 1. Calculate Cart Total from DB (Security: Don't trust frontend)
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { 
                items: {
                    include: { product: true }
                } 
            }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const totalAmount = cart.items.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        // Stripe expects amount in cents (integers)
        const amountInCents = Math.round(totalAmount * 100);

        if (amountInCents < 50) { // Minimum charge usually ~50 cents
             return res.status(400).json({ message: 'Amount too small' });
        }

        // 2. Create Intent
        const paymentIntent = await PaymentService.createPaymentIntent(amountInCents, 'usd');

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: totalAmount
        });

    } catch (error: any) {
        console.error("Payment intent error:", error);
        res.status(500).json({ message: 'Payment initiation failed', error: error.message });
    }
};
