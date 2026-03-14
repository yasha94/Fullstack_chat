import messagesRepo from '../repositories/messagesRepo.js';

const getMessages = async (filters, options) => {
    try {
        return await messagesRepo.getMessages(filters, options);
    } catch (err) {
        return { errorMsg: `A db error has occurred: ${err.message}` };
    }
};

const getMessageById = async (id) => {
    try {
        return await messagesRepo.getMessageById(id);
    } catch (err) {
        return { errorMsg: `A db error has occurred: ${err.message}` };
    }
};

const addMessage = async (obj) => {
    try {
        return await messagesRepo.addMessage(obj);
    } catch (err) {
        return { errorMsg: `A db error has occurred: ${err.message}` };
    }
};

const updateMessage = async (id, obj) => {
    try {
        return await messagesRepo.updateMessage(id, obj);
    } catch (err) {
        return { errorMsg: `A db error has occurred: ${err.message}` };
    }
};

const deleteMessage = async (id) => {
    try {
        return await messagesRepo.deleteMessage(id);
    } catch (err) {
        return { errorMsg: `A db error has occurred: ${err.message}` };
    }
};

export default {
    getMessages,
    getMessageById,
    addMessage,
    updateMessage,
    deleteMessage,
};
