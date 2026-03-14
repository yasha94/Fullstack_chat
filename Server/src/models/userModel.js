import mongoose from 'mongoose';
// import FriendReq from '../models/friendReqModel.js';

const UserSchema = mongoose.Schema(
  {
    firstName: { 
      type: String, 
      required: true 
    },
    lastName: { 
      type: String, 
      required: true 
    },
    userName: { 
      type: String, 
      required: true, 
      unique: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    phoneNumber: { 
      type: String, 
      unique: true
    },
    password: { 
      type: String, 
      required: true 
    },
    friends: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    blocked: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    profilePicture: { 
      type: String
    },
    profilePictureMimeType: {
       type: String 
    },
    status: { 
      type: String, 
      enum: ["online", "offline"], 
      default: "offline"
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    lastSeen: { 
      type: Date 
    },
  },
  { versionKey: false }
);


// UserSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });


const User = mongoose.model('User', UserSchema, 'users');

export default User;
