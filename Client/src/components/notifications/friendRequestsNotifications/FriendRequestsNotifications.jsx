import {Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { listenToNewFriendRequests } from '../../../services/socketServices/socketFriendRequests/friendRequestsSocketListeners';
import Badge from '@mui/material/Badge';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import useSocket from '../../../hooks/useSocket';
import useAppTheme from '../../../hooks/useAppTheme';
import useFrindRequests from '../../../hooks/useFriendRequests';


const FriendRequestsNotifications = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { socket } = useSocket();
    const { appTheme } = useAppTheme();
    const { friendRequestsCounter, setFriendRequestsCounter } = useFrindRequests();
    const [numberOfNewRequests, setNumberOfNewRequests] = useState(0);
  
    const isDark = !!appTheme;
    const colors = {
      bg: isDark ? "#211f30" : "#a8a6b8",
      fg: isDark ? "#a8a6b8" : "#211f30",
      bgHover: isDark ? "#2b2742" : "#b8b6c6",
      border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    };

    // useEffect(() => {
    //     console.log("tetting socket in friend requests0");            
    //     if (!socket) return; // Ensure socket is available before setting up listeners
    //     console.log("tetting socket in friend requests");            
    //     const receiveFriendRequestHandler = () => {
    //         // if(location.pathname === '/Friend-requests') return;
    //         console.log(`location`, location);
            
    //         setNumberOfNewRequests(prevNum => prevNum + 1);
    //     };
        
    //     socket.on('newFriendRequest', receiveFriendRequestHandler);
        
    //     // cleanup so you don’t register duplicates
    //     return () => {
    //         socket.off('newFriendRequest', receiveFriendRequestHandler);
    //     };
    // }, [socket]);

    // listenToNewFriendRequests(socket)
  
    return (
        <div className="navIcon" style={{position: 'relative'}} title="Friend Requests">
            <Badge 
                badgeContent={friendRequestsCounter} 
                color="warning" 
                overlap="circular"
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    '& .MuiBadge-badge': {
                        right: -3,
                        top: 13,
                        border: `2px solid ${colors.bg}`,
                        padding: '0 4px',
                        color: colors.fg,
                    }
                }}
            >
                <PeopleAltOutlinedIcon 
                    style={{color: colors.fg, fontSize: '33px', cursor: 'pointer'}} 
                    onClick={() => {
                        setFriendRequestsCounter(0);
                        navigate('/Friend-requests');
                    }}
                />
            </Badge>
        </div>
    );
}

export default FriendRequestsNotifications;