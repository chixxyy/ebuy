import { Router } from 'express';
import { addToCart, getCart } from '../controllers/cart.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, addToCart);
router.get('/', authenticateToken, getCart);

export default router;
