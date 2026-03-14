import express from 'express';
import friendsReqController from '../controllers/friendsReqcontroller.js';
import authMiddlewares from '../middlewares/auth-middleware.js';
const {authMiddleware} = authMiddlewares
const router = express.Router();

// friendsReq/Routes
router.get('/', authMiddleware, friendsReqController.getAllUsersFriendsRequests);
router.get('/sentRequests', authMiddleware, friendsReqController.getUsersSentFriendsRequests);
router.post('/reject', authMiddleware, friendsReqController.rejectFriendRequest);

export default router;