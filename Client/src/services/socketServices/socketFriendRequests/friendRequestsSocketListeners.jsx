import { useEffect, useState } from 'react';
import useSocket from '../../../hooks/useSocket';
import useFrindRequests from '../../../hooks/useFriendRequests';
import newFriendRequestSound from '../../../assets/sounds/newFriendRequest.mp3';


const listenToNewFriendRequests = () => {
    const { socket } = useSocket();
    const { friendRequests, setFriendRequests, friendRequestsCounter, setFriendRequestsCounter } = useFrindRequests();

    useEffect(() => {
        if (!socket) return; // Ensure socket is available before setting up listeners
        
        const receiveFriendRequestHandler = (data) => {
            const audio = new Audio(newFriendRequestSound);
            audio.play();
            setFriendRequestsCounter(prevNum => prevNum + 1);
            setFriendRequests(prevFr => [...prevFr, data]);
        };
        
        socket.on('newFriendRequest', receiveFriendRequestHandler);
        
        // cleanup so you don’t register duplicates
        return () => {
            socket.off('newFriendRequest', receiveFriendRequestHandler);
        };
    }, [socket]);
}

export {listenToNewFriendRequests};