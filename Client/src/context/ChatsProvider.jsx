import { createContext, useState, useCallback, useReducer, useEffect, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';
import { messagesReducer, initialMessagesState, MESSAGES_ACTIONS } from './messagesReducer';
import { getAll } from '../services/crud/crud';

const chatsContext = createContext({});

const MESSAGES_URL = '/messages';

export const ChatsProvider = ({ children }) => {
    const [chat, setChat]   = useState(null);
    const [friend, setFriend] = useState(null);
    const [chats, setChats]  = useState([]);

    const [messagesState, dispatchMessages] = useReducer(messagesReducer, initialMessagesState);

    const { auth }   = useAuth();
    const { socket } = useSocket();

    // Ref keeps the active chatId accessible inside socket callbacks without stale closure
    const activeChatIdRef = useRef(null);
    useEffect(() => {
        activeChatIdRef.current = chat?._id ?? null;
    }, [chat?._id]);

    // ─── Socket: receive messages ────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            // If the incoming message belongs to the active chat, add it to the list
            if (message?.chatId && String(message.chatId) === String(activeChatIdRef.current)) {
                dispatchMessages({ type: MESSAGES_ACTIONS.ADD_MESSAGE, payload: message });
            }

            // Always update the chat-list preview so unread / last-message stays current
            setChats((prev) =>
                prev.map((c) =>
                    String(c._id) === String(message?.chatId)
                        ? { ...c, lastMessage: message, lastMessageAt: message.createdAt, updatedAt: message.createdAt }
                        : c
                )
            );
        };

        socket.on('newMessage', handleNewMessage);
        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket]);

    // ─── Load messages when active chat changes ───────────────────────────────
    useEffect(() => {
        if (!chat?._id || !auth?.accessToken) {
            dispatchMessages({ type: MESSAGES_ACTIONS.RESET });
            return;
        }

        const chatId = chat._id; // capture for stale-response guard
        dispatchMessages({ type: MESSAGES_ACTIONS.RESET });

        const load = async () => {
            dispatchMessages({ type: MESSAGES_ACTIONS.SET_LOADING, payload: true });
            try {
                const params = { chatId, limit: 20 };
                const response = await getAll(MESSAGES_URL, params, auth.accessToken);

                // Discard result if the user switched chats while the request was in-flight
                if (activeChatIdRef.current !== chatId) return;

                if (response?.data?.errorMsg) {
                    dispatchMessages({ type: MESSAGES_ACTIONS.SET_ERROR, payload: response.data.errorMsg });
                    return;
                }

                const { messages = [], hasMore = false, nextCursor = null } = response?.data ?? {};
                dispatchMessages({
                    type: MESSAGES_ACTIONS.SET_MESSAGES,
                    payload: { messages, hasMore, cursor: nextCursor },
                });
            } catch (err) {
                if (activeChatIdRef.current !== chatId) return;
                console.error('loadMessages error:', err);
                dispatchMessages({ type: MESSAGES_ACTIONS.SET_ERROR, payload: 'Failed to load messages.' });
            }
        };

        load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chat?._id, auth?.accessToken]);

    // ─── Load more (older) messages for pagination ───────────────────────────
    const loadMoreMessages = useCallback(async () => {
        if (!chat?._id || !auth?.accessToken) return;
        if (messagesState.loading || !messagesState.hasMore) return;

        const chatId = chat._id;
        dispatchMessages({ type: MESSAGES_ACTIONS.SET_LOADING, payload: true });

        try {
            const params = { chatId, limit: 20 };
            if (messagesState.cursor) params.cursor = messagesState.cursor;

            const response = await getAll(MESSAGES_URL, params, auth.accessToken);

            if (activeChatIdRef.current !== chatId) return;

            if (response?.data?.errorMsg) {
                dispatchMessages({ type: MESSAGES_ACTIONS.SET_ERROR, payload: response.data.errorMsg });
                return;
            }

            const { messages = [], hasMore = false, nextCursor = null } = response?.data ?? {};
            dispatchMessages({
                type: MESSAGES_ACTIONS.APPEND_OLDER,
                payload: { messages, hasMore, cursor: nextCursor },
            });
        } catch (err) {
            if (activeChatIdRef.current !== chatId) return;
            console.error('loadMoreMessages error:', err);
            dispatchMessages({ type: MESSAGES_ACTIONS.SET_ERROR, payload: 'Failed to load more messages.' });
        }
    }, [chat?._id, auth?.accessToken, messagesState.loading, messagesState.hasMore, messagesState.cursor]);

    // ─── Called by Chat.jsx after the server ack confirms a sent message ─────
    const addSentMessage = useCallback((message) => {
        dispatchMessages({ type: MESSAGES_ACTIONS.ADD_MESSAGE, payload: message });

        // Keep the chat-list preview in sync for the sender's own view
        setChats((prev) =>
            prev.map((c) =>
                String(c._id) === String(message?.chatId)
                    ? { ...c, lastMessage: message, lastMessageAt: message.createdAt, updatedAt: message.createdAt }
                    : c
            )
        );
    }, []);

    // ─── Select the other participant as the active "friend" ─────────────────
    const onSelectFriend = useCallback((selectedChat) => {
        if (selectedChat?.participants?.length) {
            const other =
                String(selectedChat.participants[0]?._id) === String(auth?.user?._id)
                    ? selectedChat.participants[1]
                    : selectedChat.participants[0];
            setFriend(other ?? null);
        }
    }, [auth?.user?._id]);

    return (
        <chatsContext.Provider value={{
            chat, setChat,
            chats, setChats,
            friend, setFriend,
            onSelectFriend,
            messagesState,
            loadMoreMessages,
            addSentMessage,
        }}>
            {children}
        </chatsContext.Provider>
    );
};

export default chatsContext;
