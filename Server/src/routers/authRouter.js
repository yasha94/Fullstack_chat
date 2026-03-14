import express from 'express';
import authController from '../controllers/authController.js';
import authMiddlewares from '../middlewares/auth-middleware.js';
const {authMiddleware} = authMiddlewares

const router = express.Router();

router.post('/login', authController.login);
router.get('/logout', authMiddleware, authController.logOut);

export default router;