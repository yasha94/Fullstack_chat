import mongoose from 'mongoose';



const MessageSchema = mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    messageFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messageTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    repliedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null},
    filesPath: [{ type: String }],
    status: { type: Number, enum: [1, 2, 3], default: 1 },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { 
    versionKey: false 
  });

  /** Helpful compound indexes for common queries */
MessageSchema.index({ messageFrom: 1, messageTo: 1, createdAt: -1 });
MessageSchema.index({ messageTo: 1, createdAt: -1 });
MessageSchema.index({ messageFrom: 1, createdAt: -1 });

const Message = mongoose.model('Message', MessageSchema, 'messages');

export default Message;
