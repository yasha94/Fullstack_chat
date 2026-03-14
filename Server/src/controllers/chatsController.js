import mongoose from 'mongoose';
import chatsService from '../services/chatsService.js';

const getChats = async (req, res) => {
    const userId = req.query?.params?.userId;
    const q = (req.query?.params?.q || '').trim();

    const rawLimit = parseInt(req.query?.params?.limit) || 20;
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 20;

    // Cursor is keyed on updatedAt (most-recently-active ordering)
    const after   = req.query?.params?.cursor?.after   || null;
    const afterId = req.query?.params?.cursor?.afterId || null;

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(400).send({ errorMsg: 'Invalid or missing userId' });
    }

    if (afterId && !mongoose.isValidObjectId(afterId)) {
        return res.status(400).send({ errorMsg: 'Invalid afterId' });
    }

    const andConds = [];
    andConds.push({ participants: { $in: [userId] } });

    if (q) {
        andConds.push({
            $or: [
                { name: { $regex: q, $options: 'i' } },
            ],
        });
    }

    if (after) {
        const afterDate = new Date(after);
        if (Number.isNaN(afterDate.getTime())) {
            return res.status(400).send({ errorMsg: 'Invalid after (must be ISO date string)' });
        }

        const cursorOr = [{ updatedAt: { $lt: afterDate } }];
        if (afterId) {
            cursorOr.push({
                updatedAt: afterDate,
                _id: { $lt: new mongoose.Types.ObjectId(afterId) },
            });
        }

        andConds.push({ $or: cursorOr });
    }

    const match = andConds.length ? { $and: andConds } : {};
    const checkForMore = limit + 1;

    // Sort by most-recently-active first
    const options = { sort: { updatedAt: -1, _id: -1 }, limit: checkForMore };

    const chats = await chatsService.getChats(match, options);

    if (chats.errorMsg) {
        return res.status(500).send({ errorMsg: chats.errorMsg });
    }

    let hasMore = false;
    let nextCursor = null;

    if (chats.length > limit) {
        chats.pop();
        hasMore = true;
        const last = chats[chats.length - 1];
        nextCursor = {
            after: last.updatedAt?.toISOString?.() || new Date().toISOString(),
            afterId: String(last._id),
        };
    }

    await Promise.all(
        chats.map((chat) =>
            chat.populate([
                {
                    path: 'participants',
                    select: '_id firstName lastName userName profilePicture profilePictureMimeType status createdAt',
                },
                {
                    path: 'lastMessage',
                    select: '_id content createdAt messageFrom',
                },
            ])
        )
    );

    return res.status(200).send({ chats, hasMore, nextCursor });
};

const getChatsByParticipants = async (req, res) => {
    const userIds = req.query?.params?.userIds;

    if (!userIds || !Array.isArray(userIds) || userIds.length < 1) {
        return res.status(400).send({ errorMsg: 'Invalid or missing userIds array' });
    }

    const chats = await chatsService.getChats({
        participants: { $all: userIds },
        $expr: { $eq: [{ $size: '$participants' }, userIds.length] },
    });

    if (chats.errorMsg) {
        return res.status(500).send({ errorMsg: chats.errorMsg });
    }

    if (chats.length === 0) {
        if (userIds.length === 2) {
            const newChat = await chatsService.addChat({ participants: userIds, type: 'direct' });
            if (newChat.errorMsg) {
                return res.status(500).send({ errorMsg: newChat.errorMsg });
            }
            await newChat.populate({
                path: 'participants',
                select: '_id firstName lastName userName profilePicture profilePictureMimeType status createdAt',
            });
            return res.status(201).send(newChat);
        }
        return res.status(404).send({ errorMsg: 'No group chat found for the given participants' });
    }

    return res.status(200).send(chats);
};

const createChat = async (req, res) => {
    const userIds = req.body?.userIds;
    const type = req.body?.type || 'direct';

    if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).send({ errorMsg: 'No user IDs provided.' });
    }

    if (type !== 'direct' && type !== 'group') {
        return res.status(400).send({ errorMsg: 'Invalid chat type. Must be "direct" or "group".' });
    }

    if (type === 'direct' && userIds.length !== 2 && userIds.length !== 1) {
        return res.status(400).send({ errorMsg: 'Direct chat requires 1 or 2 user IDs.' });
    }

    if (type === 'group' && userIds.length < 1) {
        return res.status(400).send({ errorMsg: 'Group chat requires at least 1 user ID.' });
    }

    if (type === 'direct') {
        const existingChats = await chatsService.getChats({
            type: 'direct',
            participants: { $all: userIds },
            $expr: { $eq: [{ $size: '$participants' }, userIds.length] },
        });

        if (existingChats.errorMsg) {
            return res.status(500).send({ errorMsg: existingChats.errorMsg });
        }

        if (existingChats.length > 0) {
            return res.status(200).send(existingChats[0]);
        }
    }

    const chatData = { participants: userIds, type };

    if (type === 'group') {
        chatData.groupManagers = req.body?.groupManagers || [userIds[0]];
        chatData.name         = req.body?.name         || 'New group chat';
        chatData.description  = req.body?.description  || '';
    }

    const newChat = await chatsService.addChat(chatData);

    if (newChat.errorMsg) {
        return res.status(500).send({ errorMsg: newChat.errorMsg });
    }

    await newChat.populate({
        path: 'participants',
        select: '_id firstName lastName userName profilePicture profilePictureMimeType status createdAt',
    });

    return res.status(201).send(newChat);
};

export default {
    getChats,
    getChatsByParticipants,
    createChat,
};
