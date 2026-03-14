import mongoose, { Types } from 'mongoose';

const ChatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
    },

    participants: [
      {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    // GROUP-ONLY FIELDS
    groupManagers: [
      {
        type: Types.ObjectId,
        ref: 'User',
        required: function () {
          return this.type === 'group';
        },
      },
    ],

    name: {
      type: String,
      trim: true,
      required: function () {
        return this.type === 'group';
      },
    },

    photo: {
      type: String,
    },
    photoMimeType: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },

    // COMMON FIELDS
    unread: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        count: { type: Number, default: 0 },
        lastReadAt: { type: Date, default: null }, // optional, but useful
      }
    ],
    lastMessage: {
      type: Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// PARTICIPANTS RULES
ChatSchema.path('participants').validate(
  function (value) {
    // `this` is the document here because we use function ()
    if (!Array.isArray(value) || value.length === 0) return false;

    if (this.type === 'direct') {
      // 1 participant = self messages, 2 = normal direct
      return value.length === 1 || value.length === 2;
    }

    if (this.type === 'group') {
      return value.length >= 1;
    }

    return false;
  },
  'Invalid number of participants for chat type'
);

// PRE-SAVE HOOK
ChatSchema.pre('save', async function (next) {
  if (this.type === 'direct') {
    // Remove group-only fields
    this.name = undefined;
    this.description = undefined;
    this.photo = undefined;
    this.photoMimeType = undefined;
    this.groupManagers = undefined;
    if (this.participants.length === 2) {
      this.participants.sort((a, b) =>
        a.toString().localeCompare(b.toString())
      );
    }
    // If creating a self-chat, skip duplicate check (handled at service layer)
    if (this.participants.length === 1) {
      const existing = await Chat.findOne({
        type: 'direct',
        participants: this.participants[0],
        $expr: { $eq: [{ $size: '$participants' }, 1] },
      });

      if (existing) {
        const err = new Error('Self-chat already exists');
        err.code = 'DUPLICATE_CHAT';
        return next(err);
      }
    }
  }

  next();
});

const Chat = mongoose.model('Chat', ChatSchema, 'chats');
export default Chat;
