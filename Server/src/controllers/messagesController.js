import mongoose from 'mongoose';
import messagesService from '../services/messageService.js';
import chatsService from '../services/chatsService.js';
import onlineSockets from '../utils/onlineSockets.js';

const getMessages = async (req, res) => {
    const chatId = req.query?.params?.chatId;
    const q = (req.query?.params?.q || '').trim();

    const rawLimit = parseInt(req.query?.params?.limit) || 20;
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 20;

    const after   = req.query?.params?.cursor?.after   || null;
    const afterId = req.query?.params?.cursor?.afterId || null;

    if (!chatId || !mongoose.isValidObjectId(chatId)) {
        return res.status(400).send({ errorMsg: 'Invalid or missing chatId' });
    }

    if (afterId && !mongoose.isValidObjectId(afterId)) {
        return res.status(400).send({ errorMsg: 'Invalid afterId' });
    }

    const andConds = [];
    andConds.push({ chatId });

    if (q) {
        andConds.push({
            $or: [
                { 'messageFrom.userName': { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } },
            ],
        });
    }

    if (after) {
        const afterDate = new Date(after);
        if (Number.isNaN(afterDate.getTime())) {
            return res.status(400).send({ errorMsg: 'Invalid after (must be ISO date string)' });
        }

        const cursorOr = [{ createdAt: { $lt: afterDate } }];
        if (afterId) {
            cursorOr.push({
                createdAt: afterDate,
                _id: { $lt: new mongoose.Types.ObjectId(afterId) },
            });
        }

        andConds.push({ $or: cursorOr });
    }

    const match = andConds.length ? { $and: andConds } : {};
    const checkForMore = limit + 1;
    const options = { sort: { createdAt: -1, _id: -1 }, limit: checkForMore };

    const messages = await messagesService.getMessages(match, options);

    if (messages.errorMsg) {
        return res.status(500).send({ errorMsg: messages.errorMsg });
    }

    let hasMore = false;
    let nextCursor = null;

    if (messages.length > limit) {
        messages.pop();
        hasMore = true;
        const last = messages[messages.length - 1];
        nextCursor = {
            after: last.createdAt?.toISOString?.() || new Date().toISOString(),
            afterId: String(last._id),
        };
    }

    return res.status(200).send({ messages, hasMore, nextCursor });
};


const handleSendMessage = (socket) => {
    socket.on('sendMessage', async (data, cb) => {
        // Centralised responder — always invoke cb if the client provided one
        const respond = (err, payload) => { if (typeof cb === 'function') cb(err, payload); };

        try {
            if (!data || typeof data !== 'object') {
                respond({ error: 'Invalid payload' });
                return;
            }

            const { chatId, users, message } = data;

            if (!chatId || !mongoose.isValidObjectId(chatId)) {
                respond({ error: 'Invalid or missing chatId' });
                return;
            }

            if (!users || typeof users !== 'object') {
                respond({ error: 'Invalid or missing users' });
                return;
            }

            const { senderId, recieverId } = users;

            if (!senderId || !mongoose.isValidObjectId(senderId)) {
                respond({ error: 'Invalid or missing senderId' });
                return;
            }

            if (!recieverId || !mongoose.isValidObjectId(recieverId)) {
                respond({ error: 'Invalid or missing recieverId' });
                return;
            }

            const trimmedContent = (message || '').trim();
            if (!trimmedContent) {
                respond({ error: 'Message content cannot be empty' });
                return;
            }

            const newMsg = {
                chatId,
                messageFrom: senderId,
                messageTo: recieverId,
                content: trimmedContent,
                filesPath: [],
            };

            const savedMessage = await messagesService.addMessage(newMsg);

            if (savedMessage?.errorMsg) {
                respond({ error: savedMessage.errorMsg });
                return;
            }

            // Update the chat's lastMessage and bump updatedAt so chat list re-sorts correctly
            await chatsService.updateChat(chatId, {
                $set: {
                    lastMessage: savedMessage._id,
                    lastMessageAt: savedMessage.createdAt,
                    updatedAt: savedMessage.createdAt,
                },
            });

            // Acknowledge to the sender with the full persisted message
            respond(null, savedMessage);

            // Forward to the receiver if they are currently online
            const receiverSocketId = onlineSockets.get(recieverId);
            if (receiverSocketId) {
                socket.to(receiverSocketId).emit('newMessage', savedMessage);
            }

        } catch (err) {
            console.error('handleSendMessage error:', err);
            respond({ error: 'Internal server error' });
        }
    });
};

export default {
    getMessages,
    handleSendMessage,
};
