import express from 'express';
import messagesController from '../controllers/messagesController.js';
import authMiddlewares from '../middlewares/auth-middleware.js';
const {authMiddleware} = authMiddlewares
const router = express.Router();

router.get('/', authMiddleware, messagesController.getMessages);

export default router;