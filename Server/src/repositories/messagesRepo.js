import Message from '../models/messageModel.js';

const POPULATE_MESSAGE_FROM = { path: 'messageFrom', select: '_id userName' };
const POPULATE_MESSAGE_TO   = { path: 'messageTo',   select: '_id userName' };

// Get All
const getMessages = (filters, options) => {
  return Message.find(filters)
    .populate(POPULATE_MESSAGE_FROM)
    .populate(POPULATE_MESSAGE_TO)
    .setOptions(options);
};

// Get By ID
const getMessageById = (id) => {
  return Message.findById(id)
    .populate(POPULATE_MESSAGE_FROM)
    .populate(POPULATE_MESSAGE_TO);
};

// Create – Message.create() returns a plain Promise, so we must populate after awaiting
const addMessage = async (obj) => {
  const msg = await Message.create(obj);
  await msg.populate(POPULATE_MESSAGE_FROM);
  await msg.populate(POPULATE_MESSAGE_TO);
  return msg;
};

// Update
const updateMessage = (id, obj) => {
  return Message.findByIdAndUpdate(id, obj, { new: true });
};

// Delete
const deleteMessage = (id) => {
  return Message.findByIdAndDelete(id);
};

export default {
  getMessages,
  getMessageById,
  addMessage,
  updateMessage,
  deleteMessage,
};
