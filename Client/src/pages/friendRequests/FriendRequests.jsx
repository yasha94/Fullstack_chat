import { useState, useEffect, useMemo } from 'react';
import { getAll, addItem } from '../../services/crud/crud';
import useAppTheme from '../../hooks/useAppTheme';
import useAuth from "../../hooks/useAuth";
import useSocket from '../../hooks/useSocket';
import useChats from "../../hooks/useChats";
import useFrindRequests from '../../hooks/useFriendRequests';
import { useNavigate } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';

const FRIEND_REQUESTS_URL = '/friendsReq';
const CREATE_CHAT_URL = '/chats/createChat';

const FriendRequests = () => {
    const { socket } = useSocket();
    const { auth } = useAuth();
    const { appTheme } = useAppTheme();
    const { setChats } = useChats();
    const { friendRequests, setFriendRequests } = useFrindRequests();
    const navigate = useNavigate();

    useEffect(() => {
        const getFriendRequests = async () => {
            const response = await getAll(FRIEND_REQUESTS_URL, auth?.user?._id, auth?.accessToken);
            if (response?.data) {
                setFriendRequests(response.data);
            }
        };
        getFriendRequests();
    }, []);


    useEffect(() => {
        if (!socket) return; // Ensure socket is available before setting up listeners
    
        const errorHandler = (err) => {
            console.log("newFriendRequestError", err);
            // setSentRequests(prev => new Set(prev).add(err[1]));
        };
    
        socket.on('newFriendRequestError', errorHandler);
    
        return () => {
            socket.off('newFriendRequestError', errorHandler);
        };
    }, [socket]);
    
    const acceptFriendRequest = (friendRequest) => {
        try{
            const { profilePicture, profilePictureMimeType, ...safeRequester } = friendRequest.requester;
            const { profilePicture: rqPic, profilePictureMimeType: rqMime, ...safeRecipient } = friendRequest.recipient;
            const safeFriendRequest = {
                ...friendRequest,
                requester: safeRequester,
                recipient: safeRecipient,
            };
            console.log(`friendRequest`, friendRequest);    
            console.log(`safeFriendRequest`, safeFriendRequest);    
            return new Promise((resolve) => {
                socket.emit('acceptFriendRequest', safeFriendRequest, (res0, res) => {
                    console.log(`acceptFriendRequest response`, res);
                    console.log(`acceptFriendRequest`, res0);                    
                    if(res?.status === 'accepted'){
                        setFriendRequests(prevFr => prevFr.map(frItem => frItem._id === friendRequest._id ? {...frItem, status: 'accepted'} : frItem));
                    }
                    resolve(res);
                });
            });
        } catch(e){
            console.log(`acceptFriendRequest error`, e);
        } 
    }

     /**
     * 
     * TODO: 1. check if chat already exists between these two users
     *       2. if exists, navigate to that chat
     *       3. if not, create new chat and navigate to it
     *       4.create socket event for creating chat making sure the chat is created only once between two users
     */
     const createDirectChat = async (userId) => {
        console.log(`createDirectChat called with userId: ${userId}`);
        try {
            const chatObj = {
                type: 'direct',
                userIds: [auth.user._id, userId],
            };
            const response = await addItem(CREATE_CHAT_URL, chatObj, auth?.accessToken);
            if (response?.data) {
                console.log('Direct chat created:', response.data);
                setChats(prev => [response.data, ...prev]);
            }
        } catch (err) {
            console.log('createDirectChat error', err);
        }
    }


    console.log(`friendRequests`, friendRequests);
    return useMemo(() => {
        return (
            // <div style={{height: 'fit-content', marginTop: '80px',}}>
                <table style={{ width: '35%', borderCollapse: 'separate', borderSpacing: '0 12px'}}>
                    <tbody>
                        {Array.isArray(friendRequests) && friendRequests.map((friendRequest) => (                            
                            friendRequest.status === 'pending' && <tr
                            key={friendRequest._id}
                            style={{
                            backgroundColor: appTheme ? '#2c2a3c' : '#a8a6b8',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            transition: 'transform 0.2s ease',
                            cursor: 'pointer',
                        }}                            
                            // onClick={() => navigate(`/users/${friendRequest.requester?.userName}`)}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                        >
                            <td style={{ padding: '12px', display: 'flex', alignItems: 'center', width: '48%' }}>
                            {friendRequest.requester?.profilePicture ? 
                                <Avatar alt={friendRequest.requester?.userName} src={`data:${friendRequest.requester?.profilePictureMimeType};base64,${friendRequest.requester?.profilePicture}`} sx={{marginRight: 0, width: 70, height: 70}}/> 
                                :
                                <Avatar sx={{marginRight: 4, width: 70, height: 70, backgroundColor: appTheme ? '#a8a6b8' : '#2c2a3c', color: appTheme ? '#2c2a3c' : '#a8a6b8'}}>{friendRequest.requester?.firstName.charAt(0).toUpperCase()}{friendRequest.requester?.lastName.charAt(0).toUpperCase()}</Avatar>
                            }
                            </td>
                            <td onClick={() => navigate(`/users/${friendRequest.requester?.userName}`)} style={{padding: '0px 10px'}}>
                                <div>
                                    <div style={{fontWeight: 'bold'}}>{friendRequest.requester?.userName}</div>
                                    <div>{friendRequest.requester?.firstName} {friendRequest.requester?.lastName}</div>
                                </div>
                            </td>
                            <td>
                            {friendRequest?.status === 'pending'
                                ? <button onClick={async (e) => {
                                    e.stopPropagation(); // Prevent navigation
                                    console.log(`0`);                            
                                    await acceptFriendRequest(friendRequest);
                                    console.log(`1`);                            
                                    await createDirectChat(friendRequest.requester?._id);
                                    console.log(`2`);                                
                                }}
                                >
                                Accept
                                </button>
                                : <p>Friends</p> }
                            </td>
                            <td style={{ padding: '10px' }}>
                                {friendRequest?.recipient?._id
                                ? <button>Reject</button>
                                : <p></p>}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            // </div>
        );
    }, [friendRequests, appTheme]);
};

export default FriendRequests;
