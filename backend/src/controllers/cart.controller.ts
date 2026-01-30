// src/controllers/cart.controller.ts
import { Request, Response } from 'express';
import * as CartService from '../services/cart.service';

export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Missing productId or quantity' });
        }

        // Call the debounced service
        // Since it's debounced, this returns immediately saying "Accepted"
        const result = await CartService.addToCartDebounced(userId, parseInt(productId), parseInt(quantity));
        
        res.status(202).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error });
    }
};

export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const cart = await CartService.getCart(userId);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
};
