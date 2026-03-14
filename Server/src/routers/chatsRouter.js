import express from 'express';
import chatsController from '../controllers/chatsController.js';
import authMiddlewares from '../middlewares/auth-middleware.js';
const {authMiddleware} = authMiddlewares
const router = express.Router();

// chats/ROUTES
router.get('/', authMiddleware, chatsController.getChats);
router.get('/byParticipants', authMiddleware, chatsController.getChatsByParticipants);
router.post('/createChat', authMiddleware, chatsController.createChat);

export default router;