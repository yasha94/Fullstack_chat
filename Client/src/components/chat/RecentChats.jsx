import { useEffect, useState, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Avatar from "@mui/material/Avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import useAuth from "../../hooks/useAuth";
import useChats from "../../hooks/useChats";
import { getAll } from "../../services/crud/crud";

const CHATS_URL = "chats";

const RecentChats = () => {
  const { auth } = useAuth();
  const { setChat, chat, chats, setChats, onSelectFriend } = useChats();

  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

const normalizeChatsResponse = (data) => {
    if (!data) return { chats: [], hasMore: false, nextCursor: null };
    if (Array.isArray(data)) return { chats: data, hasMore: false, nextCursor: null };
    const { chats = [], hasMore = false, nextCursor = null } = data;
    return { chats, hasMore, nextCursor };
    };

    useEffect(() => {
        if (!auth?.user?._id || !auth?.accessToken) return;
        // if(chats.length !== 0) return;

        setChats([]);
        setCursor(null);
        setHasMore(true);
        setErrorMsg("");

        const loadInitialChats = async () => {            
            setLoading(true);
            try {
                const params = { userId: auth.user?._id, limit: 10 };
                const response = await getAll(CHATS_URL, params, auth?.accessToken);

                if (response?.errorMsg) {
                setErrorMsg(response.errorMsg);
                setHasMore(false);
                return;
                }

                if (response?.data) {
                    const { chats, hasMore, nextCursor } =
                    normalizeChatsResponse(response.data);
                    setChats(chats);
                    setHasMore(hasMore);
                    setCursor(nextCursor);
                }
                } catch (err) {
                    console.error("Initial chats fetch failed", err);
                    setErrorMsg("Failed to load recent chats.");
                    setHasMore(false);
                } finally {
                    setLoading(false);
                }
        };

        loadInitialChats();
    }, [auth?.user?._id, auth?.accessToken]);


    const fetchChats = useCallback(async () => {
        if (!auth?.user?._id || !auth?.accessToken) return;
        if (loading || !hasMore) return;

        setLoading(true);
        setErrorMsg("");

        try {
            const params = { userId: auth.user?._id, limit: 10 };
            if (cursor) params.cursor = cursor;

            const response = await getAll(CHATS_URL, params, auth.accessToken);

            if (response?.errorMsg) {
                setErrorMsg(response.errorMsg);
                setHasMore(false);
                return;
            }

            if (response?.data) {
                const { chats, hasMore, nextCursor } =
                normalizeChatsResponse(response.data);

                setChats((prev) => {
                    const seen = new Set(prev.map((c) => c._id));
                    const merged = [...prev];
                    chats.forEach((c) => {
                        if (!seen.has(c._id)) merged.push(c);
                    });
                    return merged.sort((a, b) => {
                        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
                        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
                        return bTime - aTime;
                    });
                });

                setHasMore(hasMore);
                setCursor(nextCursor || null);
        }
        } catch (err) {
            console.error("Failed to fetch chats:", err);
            setErrorMsg("Failed to load recent chats.");
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [cursor, hasMore, loading, auth?.user?._id, auth?.accessToken]);

    const getChatTitle = (chat) => {
        if (chat.type === "group" && chat.name) return chat.name;

        const currentUserId = auth.user?._id?.toString();
        const other = chat?.participants?.find(
            (p) => p?._id?.toString() !== currentUserId
        );

        return (
            `${other?.firstName || ""} ${other?.lastName || ""}`.trim() ||
            other?.userName ||
            "Unknown chat"
        );
    };

    const getLastMessagePreview = (chat) => {
        if (!chat.lastMessage?.content) return "No messages yet";
        const text = chat.lastMessage.content;
        return text.length > 40 ? `${text.slice(0, 40)}...` : text;
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        });
    };

    const onSelectChat = (chat) => {
        setChat(chat);
        onSelectFriend(chat);
    };


    return (
        <div
        style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
        }}
        >
        {errorMsg && (
            <div
            style={{
                padding: "1rem",
                color: "#f44336",
                fontSize: "0.9rem",
            }}
            >
            {errorMsg}
            </div>
        )}

        {!errorMsg && chats.length === 0 && (
            <div
            style={{
                padding: "1rem",
                fontSize: "0.9rem",
                fontWeight: "bold",
                opacity: 0.7,
            }}
            >
            You have no recent chats yet.
            </div>
        )}

        {!errorMsg && chats.length > 0 && (
            <div
            id="chatsScroll"
            style={{
                flex: 1,
                height: "70vh",
                overflowY: "auto",
                overflowX: "hidden",
            }}
            >
                <InfiniteScroll
                    dataLength={chats.length}
                    next={fetchChats}
                    hasMore={hasMore}
                    loader={
                    <h4 style={{ textAlign: "center" }}>
                        <FontAwesomeIcon icon={faSpinner} spinPulse size="xl" />
                    </h4>
                    }
                    scrollThreshold={0.99}
                    scrollableTarget="chatsScroll"
                >
                    {chats.map((chat) => (
                    <div
                        key={chat._id}
                        onClick={() => onSelectChat(chat)}
                        style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0.6rem 0.9rem",
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        gap: "0.75rem",
                        transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                            "rgba(255,255,255,0.04)";
                        }}
                        onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <Avatar
                        src={
                            auth.user?._id === chat.participants[0]?._id
                            ? chat.participants[1]?.profilePicture
                                ? `data:${chat.participants[1]?.profilePictureMimeType};base64,${chat.participants[1]?.profilePicture}`
                                : ""
                            : chat.participants[0]?.profilePicture
                            ? `data:${chat.participants[0]?.profilePictureMimeType};base64,${chat.participants[0]?.profilePicture}`
                            : ""
                        }
                        sx={{
                            width: 40,
                            height: 40,
                            fontSize: "0.9rem",
                        }}
                        />

                        <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            minWidth: 0,
                        }}
                        >
                        <div
                            style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 2,
                            }}
                        >
                            <span
                            style={{
                                fontSize: "0.95rem",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                            >
                            {getChatTitle(chat)}
                            </span>

                            <span
                            style={{
                                fontSize: "0.75rem",
                                opacity: 0.7,
                                marginLeft: "0.5rem",
                                whiteSpace: "nowrap",
                            }}
                            >
                            {formatTime(chat.updatedAt || chat.createdAt)}
                            </span>
                        </div>

                        <div
                            style={{
                            fontSize: "0.8rem",
                            opacity: 0.8,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            }}
                        >
                            {getLastMessagePreview(chat)}
                        </div>
                        </div>

                        {chat.unreadCount > 0 && (
                        <div
                            style={{
                            minWidth: 22,
                            height: 22,
                            borderRadius: "999px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "0 6px",
                            background: "#1976d2",
                            color: "#fff",
                            }}
                        >
                            {chat.unreadCount}
                        </div>
                        )}
                    </div>
                    ))}
                </InfiniteScroll>
            </div>
        )}
        </div>
    );
};

export default RecentChats;
