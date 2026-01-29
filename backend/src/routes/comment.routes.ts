import { Router } from 'express';
import { updateComment, deleteComment } from '../controllers/comment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.put('/:id', authenticateToken, updateComment);
router.delete('/:id', authenticateToken, deleteComment);

export default router;
