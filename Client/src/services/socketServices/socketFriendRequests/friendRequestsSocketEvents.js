
const sendFriendRequest = (socket, requester, recipient) => {
    try{
        socket.emit('sendFriendRequest', {
            requester,
            recipient
        }, (res, res1) => {
            console.log(`!!!res!!!`, res, res1);
            return res;        
        });
    } catch(err){
        throw new Error(err);
    }
}

export {sendFriendRequest};