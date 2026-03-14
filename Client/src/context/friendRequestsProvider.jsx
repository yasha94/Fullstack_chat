import { createContext, useState } from "react";


const friendRequestsContext = createContext({});

export const FriendRequestsProvider = ({ children }) => {
    const [friendRequests, setFriendRequests] = useState([]);
    const [friendRequestsCounter, setFriendRequestsCounter] = useState(0);

    return (
        <friendRequestsContext.Provider value={{ friendRequests, setFriendRequests, friendRequestsCounter, setFriendRequestsCounter }}>
            {children}
        </friendRequestsContext.Provider>
    );
};

export default friendRequestsContext;
