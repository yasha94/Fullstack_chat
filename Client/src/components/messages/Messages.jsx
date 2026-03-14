// src/components/messages/Messages.jsx
import useAppTheme from "../../hooks/useAppTheme";
import useAuth from "../../hooks/useAuth";
import useChats from "../../hooks/useChats";

import InfiniteScroll from "react-infinite-scroll-component";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckIcon from "@mui/icons-material/Check";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import "./Messages.css";

const Messages = () => {
  const { appTheme } = useAppTheme();
  const { auth } = useAuth();
  const { messagesState, loadMoreMessages } = useChats();

  const { messages, hasMore, loading, error } = messagesState;

  // Helper: format time (HH:MM)
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Helpers: date grouping
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getDayLabel = (dateStr) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";
    if (isSameDay(date, twoDaysAgo)) return days[twoDaysAgo.getDay()];
    if (isSameDay(date, threeDaysAgo)) return days[threeDaysAgo.getDay()];

    return date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
  };

  const isOwnMessage = (msg) =>
    String(msg?.messageFrom?._id ?? msg?.messageFrom) === String(auth?.user?._id);

  return (
    <div
      id="messagesScroll"
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        gap: "10px",
        padding: "16px",
        borderRadius: "10px",
        height: "57vh",
        width: "98%",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {error && (
        <p style={{ textAlign: "center", fontSize: 12, color: "#ff6b6b", marginBottom: 8 }}>
          {error}
        </p>
      )}

      <InfiniteScroll
        dataLength={messages.length}
        next={loadMoreMessages}
        hasMore={hasMore}
        style={{ display: "flex", flexDirection: "column-reverse" }}
        inverse={true}
        loader={
          <h4 style={{ textAlign: "center", margin: "10px 0" }}>
            <FontAwesomeIcon icon={faSpinner} spinPulse size="xl" />
          </h4>
        }
        endMessage={
          messages.length !== 0 && (
            <p style={{ textAlign: "center" }}>
              <b>🎉Yay🎉 You have seen it all</b>
            </p>
          )
        }
        scrollThreshold={0.99}
        scrollableTarget="messagesScroll"
      >
        {messages.length === 0 && !loading ? (
          <p style={{ color: appTheme ? "#fff" : "#000", textAlign: "center", paddingBottom: "13%" }}>
            No messages yet
          </p>
        ) : (
          (() => {
            const getDayKey = (dateStr) => {
              const d = new Date(dateStr);
              return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            };

            return messages.map((msg, index) => {
              const own = isOwnMessage(msg);
              const dateLabel = getDayLabel(msg.createdAt);
              const currentKey = getDayKey(msg.createdAt);
              const nextMsg = messages[index + 1];
              const nextKey = nextMsg ? getDayKey(nextMsg.createdAt) : null;

              // Show a date separator at the oldest visible message or when the day changes
              const showDateSeparator = index === messages.length - 1 || currentKey !== nextKey;

              return (
                <div key={msg._id} style={{ overflowX: "hidden" }}>
                  {showDateSeparator && (
                    <div className="messages-date-separator">
                      <span>{dateLabel}</span>
                    </div>
                  )}

                  <div className={`message-row ${own ? "message-row--own" : "message-row--other"}`}>
                    <div className={`message-bubble ${own ? "message-bubble--own" : "message-bubble--other"}`}>
                      {/* Tail */}
                      <div className={`message-tail ${own ? "message-tail--own" : "message-tail--other"}`} />

                      {/* Content */}
                      <span className="message-text">{msg.content}</span>

                      {/* Meta: time + status */}
                      <div className="message-meta">
                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                        {own && (
                          <span className={`message-status ${msg.status === 3 ? "message-status--read" : ""}`}>
                            {msg.status === 3 ? (
                              <DoneAllIcon sx={{ height: "12px", width: "12px" }} />
                            ) : (
                              <CheckIcon sx={{ height: "12px", width: "12px" }} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()
        )}
      </InfiniteScroll>
    </div>
  );
};

export default Messages;
