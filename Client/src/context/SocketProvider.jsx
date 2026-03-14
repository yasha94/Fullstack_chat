import { createContext, useState } from "react";
import { io } from 'socket.io-client';
import useAuth from "../hooks/useAuth";

const socketContext = createContext({});

export const SocketProvider = ({ children}) => {
    const [socket, setSocket] = useState(null);

    const {auth} = useAuth();

    const connectSocket = (url, t) => {
        const token = `Bearer ${auth?.accessToken}`;
        if (!socket) {
            const newSocket = io(url, {
                withCredentials: true,
                auth: {
                    token: t || '',
                },
                transports: ['websocket'],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                autoConnect: true,
            });
            setSocket(newSocket);
        }
    };

    return (
        <socketContext.Provider value={{socket, connectSocket}}>
            {children}
        </socketContext.Provider>
    )
}

export default socketContext;

