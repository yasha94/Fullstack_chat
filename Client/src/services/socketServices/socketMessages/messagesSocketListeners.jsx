import { useEffect, useState } from 'react';
import useSocket from '../../../hooks/useSocket';

const listenToNewMessages = () => {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return; // Ensure socket is available before setting up listeners
        
        const receiveMessageHandler = (data) => {

        };
        
        socket.on('newMessage', receiveMessageHandler);
        
        // cleanup so you don’t register duplicates
        return () => {
            socket.off('newFriendRequest', receiveFriendRequestHandler);
        };
    }, [socket]);
}

export {listenToNewMessages};