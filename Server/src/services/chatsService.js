import chatsRepo from '../repositories/chatsRepo.js';

const getChats = async (filters, options) => {
    try {
        return await chatsRepo.getChats(filters, options);
    } catch (err) {
        return { errorMsg: `A db error has occurred: ${err.message}` };
    }
};

const getChatById = async (id) => {
    try {
        return await chatsRepo.getChatById(id);
    } catch (err) {
        return { errorMsg: `A db error has occurred: ${err.message}` };
    }
};

const addChat = async (obj) => {
    try {
        return await chatsRepo.addChat(obj);
    } catch (err) {
        return { errorMsg: `A db error has occurred: ${err.message}` };
    }
};

const updateChat = async (id, obj) => {
    try {
        return await chatsRepo.updateChat(id, obj);
    } catch (err) {
        return { errorMsg: `A db error has occurred: ${err.message}` };
    }
};

const deleteChat = async (id) => {
    try {
        return await chatsRepo.deleteChat(id);
    } catch (err) {
        return { errorMsg: `A db error has occurred: ${err.message}` };
    }
};

export default {
    getChats,
    getChatById,
    addChat,
    updateChat,
    deleteChat,
};
