import friendReq from "../models/FriendReqModel.js";

const getAllFriendRequests = (query, requesterSelect, recipientSelect) => {

    requesterSelect = requesterSelect || '_id firstName lastName userName email profilePicture profilePictureMimeType';
    recipientSelect = recipientSelect || '_id firstName lastName userName email profilePicture profilePictureMimeType';
    return friendReq.find(query).populate({
        path: "requester",
        select: recipientSelect
    }).populate({
        path:"recipient",
        select: recipientSelect
    });
};

const getFriendRequestById = (id, requesterSelect, recipientSelect) => {
    requesterSelect = requesterSelect || '_id userName email';
    recipientSelect = recipientSelect || '_id userName email';
    return friendReq.findById(id).populate({
        path: "requester",
        select: recipientSelect
    }).populate({
        path:"recipient",
        select: recipientSelect
    });
};

const addFriendRequest = (obj) => {
    return friendReq.create(obj);
};

const updateFriendrequest = (id, obj) => {
    return friendReq.findByIdAndUpdate(id, obj);
}

const deleteFriendRequest = (id) => {
    return friendReq.findByIdAndDelete(id);
};


export default {
  getAllFriendRequests,
  getFriendRequestById,
  addFriendRequest,
  deleteFriendRequest,
  updateFriendrequest,
};