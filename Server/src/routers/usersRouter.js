import express from 'express';
import usersController from '../controllers/usersController.js';
import authMiddlewares from '../middlewares/auth-middleware.js';
const {authMiddleware} = authMiddlewares
import { uploadProfilePicture } from '../middlewares/multer-middleware.js';

const router = express.Router();
router.get('/user/:id', authMiddleware, usersController.getUserById);
router.get('/', authMiddleware, usersController.getAllUsers);
router.get('/activeUser/:id', authMiddleware, usersController.getActiveUser);
router.post('/register', uploadProfilePicture.single('profilePicture'), usersController.createUser);
router.put('/update/:id', authMiddleware ,usersController.updateUser);
router.delete('/delete/:id', authMiddleware, usersController.deleteUser);
router.get('/friends/:id', authMiddleware, usersController.getUsersFriends);


export default router;