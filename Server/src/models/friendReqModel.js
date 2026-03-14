import mongoose from 'mongoose';
import User from "../models/userModel.js";

const friendRequestSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    acknowledged: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
},
{ 
    versionKey: false 
});

friendRequestSchema.index({ recipient: 1, createdAt: -1, _id: -1 });
friendRequestSchema.index({ requester: 1, createdAt: -1 });
friendRequestSchema.index({ status: 1, recipient: 1 });


const FriendReq = mongoose.model('FriendRequest', friendRequestSchema);

export default FriendReq;
