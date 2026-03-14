import Chat  from '../models/chatModel.js';

// Get All
const getChats = (filters, options) => {
  // return Message.find(filters);
  return Chat.find(filters).setOptions(options);
};

// Get By ID
const getChatById = (id) => {
  // return Message.findById(id);
  return Chat.findById(id)
};

// Create
const addChat = (obj) => {
  return Chat.create(obj);
};

// Update
const updateChat = (id, obj) => {
  return Chat.findByIdAndUpdate(id, obj);
};

// Delete
const deleteChat = (id) => {
  return Chat.findByIdAndDelete(id);
};

export default {
  getChats,
  getChatById,
  addChat,
  updateChat,
  deleteChat,
};
