import express from 'express';
import cors from 'cors';
import { Server as socketIo } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();
import friendsReqController from './src/controllers/friendsReqcontroller.js';
import authMiddlewares from './src/middlewares/auth-middleware.js';
const {authenticateIoConnection} = authMiddlewares;
//ROUTERS
import authRouter from './src/routers/authRouter.js';
import usersRouter from './src/routers/usersRouter.js';
import friendsReqRouter from './src/routers/friendsReqRouter.js';
import chatsRouter from './src/routers/chatsRouter.js';
import messagesRouter from './src/routers/messagesRouter.js';

import connectDB from './src/configs/db.js';
import onlineSockets from './src/utils/onlineSockets.js';
import messageController from './src/controllers/messagesController.js';
import cronJobs from './src/crons/deleteFileWeekOldCron.js';

const app = express();
const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
  maxHttpBufferSize: 1e8 // 100MB
});
const PORT = 3000;

connectDB();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

//restful api
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/friendsReq', friendsReqRouter);
app.use('/chats', chatsRouter);
app.use('/messages', messagesRouter);

//Authenticate user before connecting to socket
io.use(authenticateIoConnection);

//socket.io
io.on('connection', (socket) => {
  if (!socket.authenticated) {
    socket.emit('authentication_error', { message: `Authentication error: ${socket.errorMsg}` });
    socket.disconnect();
    return;
  }

  onlineSockets.set(socket.user.id, socket.id);

  socket.on('disconnect', () => {
    onlineSockets.delete(socket.user.id);
  });

  friendsReqController.handleAcceptFriendRequest(socket);
  friendsReqController.handleAddFriendRequest(socket);
  friendsReqController.handleDeleteFriendRequest(socket);
  messageController.handleSendMessage(socket);
});

//cron jobs
cronJobs.deleteUserFilesOverWeekOld();

server.listen(PORT, () => {
  console.log(`app is listening at http://localhost:${PORT}`);
});
