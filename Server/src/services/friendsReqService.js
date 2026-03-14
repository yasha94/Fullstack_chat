import friendsReqRepo from '../repositories/friendsReqRepo.js';

const getAllFriendRequests = (query, requesterSelect, recipientSelect) => {
    return friendsReqRepo.getAllFriendRequests(query, requesterSelect, recipientSelect);
};

const getFriendRequestById = (id, requesterSelect, recipientSelect) => {
    return friendsReqRepo.getFriendRequestById(id, requesterSelect, recipientSelect);
};

const addFriendRequest = (obj) => {
    return friendsReqRepo.addFriendRequest(obj);
};

const updateFriendReq = (id, obj) => {
    try{
        return friendsReqRepo.updateFriendrequest(id, obj);
    }
    catch(err){
        return {errorMsg: `Db error ${err}`}
    }
}

const deleteFriendRequest = (id) => {
  return friendsReqRepo.deleteFriendRequest(id);
};

export default {
    getAllFriendRequests,
    getFriendRequestById,
    addFriendRequest,
    updateFriendReq,
    deleteFriendRequest,
}