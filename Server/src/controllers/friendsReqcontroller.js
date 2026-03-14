import friendsReqService from "../services/friendsReqService.js";
import usersService from '../services/usersService.js';
import onlineSockets from '../utils/onlineSockets.js';

const getAllUsersFriendsRequests = async (req, res) => {

    const userId = req.query?.params;
    const query = {
        recipient: userId
    };
    const frs = await friendsReqService.getAllFriendRequests(query);
    res.status(200).send(frs);
};

const getUsersSentFriendsRequests = async (req, res) => {

    const userId = req.query?.params;
    const query = {
        requester: userId
    };
    const frs = await friendsReqService.getAllFriendRequests(query);
    res.status(200).send(frs);
};

const rejectFriendRequest = async (req, res) => {
    const {body} = req;
    const rft = await friendsReqService.updateFriendReq(body.id, {status: "declined"});
    return res.status(200).send(rft);
};

const acceptFriendRequest = async (fr) => {
    console.log("here AcceptFriendRequest", typeof fr.requester?._id);
    const af = await usersService.addFriends(fr.requester?._id, fr.recipient?._id);
    console.log("here1 AcceptFriendRequest");
    if(af.errorMsg){
        console.log(`Error -> ${af.errorMsg}`);
        return {errorMsg: `Error -> ${af.errorMsg}`};
    }
    console.log(`inside acceptFriendRequest`);
    return await friendsReqService.updateFriendReq(fr._id, {status: "accepted"});
};


//Handle all socket events here
/**
 * 
 *   
 **/
const handleAddFriendRequest = (socket) => {
    socket.on('sendFriendRequest', async (data, cb) => {
        console.log("INSIDE sendFriendRequest");
        const friendRequests = await friendsReqService.getAllFriendRequests({
            $and: [
              { requester: data.requester },
              { recipient: data.recipient }
            ]
        });
    
        if(friendRequests.length > 0){
            console.log(`INSIDE sendFriendRequest1`);
            const pendingOrAccepted = friendRequests.filter(fr => fr.status.toString() === "pending" || fr.status.toString() === "accepted");
            if(pendingOrAccepted.length > 0){
                socket.emit('newFriendRequestError', [`Friend request to -> ${friendRequests[0].recipient.userName} was already sent`, friendRequests[0].recipient._id]);
                return;
            } 
            const declined = friendRequests.filter(fr => fr.status.toString() === "declined"); 
            if(declined.length > 3){
                socket.emit('newFriendRequestError', [`Sent to many requests to -> ${friendRequests[0].recipient.userName}`, friendRequests[0].recipient._id]);
                return;
            }
        }
        const friendRequest = await friendsReqService.addFriendRequest(data);
        const populated = await friendRequest.populate([
            { path: 'requester', select: '_id firstName lastName userName email profilePicture profilePictureMimeType' },
            { path: 'recipient', select: '_id firstName lastName userName email profilePicture profilePictureMimeType' }
          ]);
        const recipient_socket = onlineSockets.get(friendRequest.recipient._id.toString());
        console.log(`ronlineSockets.get(friendRequest.recipient._id)`, onlineSockets.get(friendRequest.recipient._id.toString()));
        console.log(`friendRequest`, friendRequest);
        console.log(`recipient_socket`, recipient_socket);
        console.log(`populated`, populated);
        socket.to(recipient_socket).emit('newFriendRequest', populated);
        cb(`Friend request sent to`, friendRequest);
    });
};


// /////////////////////////////////////////////////////////////////////////////////////////
const handleAcceptFriendRequest = (socket) => {
    socket.on('acceptFriendRequest', async (data, cb) => {
        console.log("here0 handleAcceptFriendRequest", data);
        try{
            console.log("here1 handleAcceptFriendRequest", data);
            const friendRequest = await acceptFriendRequest(data);
            console.log("here2 handleAcceptFriendRequest");
            if(friendRequest.errorMsg){
                console.log("true or false ",friendRequest.errorMsg == undefined);
                console.log("here3 handleAcceptFriendRequest");
                console.log(`friendRequest.errorMsg ${friendRequest.errorMsg}`);
                socket.emit("newFriendRequestError", friendRequest.errorMsg);
                cb('ERROR', friendRequest);
                return;
            }
            console.log("here4 handleAcceptFriendRequest");
            console.log(`friendRequest`, friendRequest);
            
            const requester = onlineSockets.get(friendRequest.requester);
            if(requester){
                socket.to(requester).emit('friendRequestAccepted', `Friend request accepted by ${data.recipient?.userName}`);
            }
            cb("you are now friends", friendRequest);
        } catch (err) {
            console.log(`Error while accepting friend request err: ${err}`);
            socket.emit("newFriendRequestError", `Error while accepting friend request err: ${err}`);
        }
    });
}

const handleDeleteFriendRequest = (socket) => {
    socket.on('deleteFriendRequest', async (data, cb) => {
        const friendRequest = await friendsReqService.deleteFriendRequest(data.id);
        const recipientSocket = onlineSockets.get(friendRequest.recipient);
        socket.emit('friendRequestDeleted', `Friend request deleted`);
        socket.to(recipientSocket).emit('friendRequestDeleted', `Friend request from ${friendRequest.requester} was deleted`);
        // cb(`Friend request deleted by ${friendRequest.recipient}`);
    });
}


export default {
    getAllUsersFriendsRequests,
    getUsersSentFriendsRequests,
    rejectFriendRequest,
    handleAddFriendRequest,
    handleAcceptFriendRequest,
    handleDeleteFriendRequest,
}