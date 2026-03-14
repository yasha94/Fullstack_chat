import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useSocket from "../../../hooks/useSocket";
import useAuth from "../../../hooks/useAuth";
import useAppTheme from "../../../hooks/useAppTheme";
import { sendFriendRequest } from "../../../services/socketServices/socketFriendRequests/friendRequestsSocketEvents";
import Avatar from '@mui/material/Avatar';

import { getAll } from "../../../services/crud/crud"; 

const FRIEND_REQUESTS_URL = '/friendsReq/sentRequests';

const Users = ({users}) => {

    const [sentRequests, setSentRequests] = useState(new Set());
    const [fr, setFr] = useState([]);

    const location = useLocation();  
    const navigate = useNavigate();
    const {stateUseres} = location.state || [];
    const { socket } = useSocket();
    const { auth } = useAuth();
    const { appTheme} = useAppTheme();

    useEffect(() => {
        const getFriendRequests = async () => {
            const response = await getAll(FRIEND_REQUESTS_URL, auth?.user?._id, auth?.accessToken);
            
            if(response.data){
                for(let i = 0; i < response.data.length; i++) {
                    setSentRequests(prev => new Set(prev).add(response.data[i]?.recipient?._id));
                }
                setFr(response.data);
            }
            console.log(`response.data`, response.data);
            console.log(`stateUsers`, stateUseres);
        };
        getFriendRequests();
    }, [stateUseres]);


    useEffect(() => {
        if (!socket) return; // Ensure socket is available before setting up listeners
    
        const errorHandler = (err) => {
            console.log("newFriendRequestError", err[0]);
            setSentRequests(prev => new Set(prev).add(err[1]));
        };
    
        socket.on('newFriendRequestError', errorHandler);
    
        return () => {
            socket.off('newFriendRequestError', errorHandler);
        };
    }, [socket]);
    

    const onAddFriend = (userId) => {
        if (sentRequests.has(userId)) return; // Prevent duplicate request
        try{
            sendFriendRequest(socket, auth.user?._id, userId);
            setSentRequests(prev => new Set(prev).add(userId));
        } catch(err){

        }
        console.log(`sendFriendRequest`);
    };
    
    console.log(`sentRequests`, sentRequests);

    if(!stateUseres || stateUseres.length === 0){
        navigate("/")
    }
    
    return (
        <table style={{ width: '50%', borderCollapse: 'separate', borderSpacing: '0 12px', margin: '80px 0px'}}>
            <tbody>
                {Array.isArray(stateUseres) && stateUseres.map((user) => (
                <tr
                    key={user._id}
                    style={{
                    backgroundColor: appTheme ? '#2c2a3c' : '#a8a6b8',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/users/${user.userName}`, { state: { user, areFriends: fr.find(u => u.recipient?._id === user._id && u.status === "accepted") ? 3 : fr.find(u => u.recipient?._id === user._id && u.status === "pending") ? 2 : 1 } })}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                >
                    {/* Avatar + Info */}
                    <td style={{ padding: '12px', display: 'flex', alignItems: 'center', width: '48%' }}>
                        {user.profilePicture ? 
                            <Avatar alt={user.userName} src={`data:${user.profilePictureMimeType};base64,${user.profilePicture}`} sx={{marginRight: 4, width: 70, height: 70}} title={`${user.userName}`}/> 
                            :
                            <Avatar title={`${user.userName}`} sx={{marginRight: 4, width: 70, height: 70, backgroundColor: appTheme ? '#a8a6b8' : '#2c2a3c', color: appTheme ? '#2c2a3c' : '#a8a6b8'}}>{user.firstName.charAt(0).toUpperCase() || ''}{user.lastName.charAt(0).toUpperCase() || ''}</Avatar>
                        }
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                            {user.firstName.replace(user.firstName.charAt(0), user.firstName.charAt(0).toUpperCase())} {user.lastName.replace(user.lastName.charAt(0), user.lastName.charAt(0).toUpperCase())}
                            </div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>{user.userName}</div>
                        </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '0px 6px', fontSize: '0.9rem', color: '#444', width: '30%' }}>
                    {user.email}
                    </td>

                    {/* Last Seen */}
                    {/* <td style={{ padding: '12px', fontSize: '0.85rem', color: '#777', width: '20%' }}>
                    {new Date(user.lastSeen).toLocaleString()}
                    </td> */}

                    {/* Add Friend */}
                    <td style={{ padding: '0px 16px', textAlign: 'right', width: '15%' }}>
                    {fr.find(u => u.recipient?._id === user._id && u.status === "accepted")  ? (
                        <span style={{ color: '#4CAF50', fontWeight: 600 }}>Friends</span>
                    ) : fr.find(u => u.recipient?._id === user._id || sentRequests.has(user._id)) ? (
                        <span style={{ color: '#FFA500', fontWeight: 600 }}>Sent</span>
                    ) : (
                        <button
                        onClick={ (e) => {
                            e.stopPropagation(); // Prevent navigation
                            onAddFriend(user._id);                            
                        }}
                        style={{
                            // backgroundColor: '#1976d2',
                            // color: '#fff',
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                        }}
                        >
                        Add Friend
                        </button>
                    )}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>

    )
}

export default Users;