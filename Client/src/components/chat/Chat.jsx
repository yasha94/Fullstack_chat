// src/components/chat/Chat.jsx
import { useEffect, useRef, useState } from "react";
import Messages from "../messages/Messages";
import useChats from "../../hooks/useChats";
import useAuth from "../../hooks/useAuth";
import useSocket from "../../hooks/useSocket";
import { sendMessage } from "../../services/socketServices/socketMessages/messagesSocketEvents";
import SendIcon from "@mui/icons-material/Send";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import "./Chat.css";

const EMOJIS = ["😀", "😂", "😍", "😎", "😢", "👍", "🙏", "🔥", "❤️", "🎉"];

const Chat = () => {
  const { chat, setChat, friend, addSentMessage } = useChats();
  const { auth } = useAuth();
  const { socket } = useSocket();

  if(!auth.accessToken){
    console.error("No auth token available in Chat component.");
  }

  const [inputValue, setInputValue] = useState(chat?.draft || "");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // When the active chat changes, load its draft into local state
  useEffect(() => {
    setInputValue(chat?.draft || "");
    setSelectedFiles([]);
    setShowEmojiPicker(false);
  }, [chat?._id]);

  // Auto-adjust textarea height like WhatsApp
  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`; // cap at 120px
  }, [inputValue]);

  const handleInputChange = (e) => {
    const value = e.target.value;

    setInputValue(value);
    setChat((prev) =>
      prev
        ? {
            ...prev,
            lastSeen: new Date().toISOString(),
            draft: value,
          }
        : prev
    );
  };

  const handleEmojiClick = (emoji) => {
    const input = textareaRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    setInputValue((prev) => {
      const next =
        prev.substring(0, start) + emoji + prev.substring(end);

      setChat((prevChat) =>
        prevChat
          ? {
              ...prevChat,
              draft: next,
            }
          : prevChat
      );

      // restore caret position after update
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = start + emoji.length;
      }, 0);
      textareaRef.current.focus();
      return next;
    });
  };



  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Basic validation – WhatsApp-ish behaviour
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const validFiles = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File "${file.name}" skipped (too large).`);
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) return;

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Allow selecting the same file again if needed
    e.target.value = null;
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!chat || !chat.participants || chat.participants.length === 0) {
      console.warn("Cannot send message: no active chat selected.");
      return;
    }
    
    const trimmed = inputValue.trim();
    const hasFiles = selectedFiles.length > 0;

    // Do not send if there is no text and no files
    if (!trimmed && !hasFiles) return;
    
    console.log(`PREPARING TO SEND MESSAGE`, {
      chatId: chat._id,
      users: {senderId: auth.user?._id, senderUserName: auth.user?.userName, recieverId: friend?._id, recieverUserName: friend?.userName},
      message: inputValue,
      files: selectedFiles,
    });

    const data = {
      chatId: chat._id,
      users: {
        senderId: auth.user?._id,
        senderUserName: auth.user?.userName,
        recieverId: friend?._id,
        recieverUserName: friend?.userName,
      },
      message: inputValue,
      files: selectedFiles,
    };

    // Clear input immediately for a responsive feel
    setInputValue("");
    setSelectedFiles([]);
    setChat((prev) => prev ? { ...prev, draft: "" } : prev);

    // Send via socket; when the server acks with the saved message, add it to state
    sendMessage(socket, data, (err, savedMessage) => {
      if (err) {
        console.error("Failed to send message:", err);
        return;
      }
      if (savedMessage) {
        addSentMessage(savedMessage);
      }
    });
  };

  const onEnterSend = (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
      handleSubmit(e);
    }
  }


  if (!chat || !chat.participants || chat.participants.length === 0) {
    return (
      <div className="chat-container chat-empty">
        <p>You are using ChatVerse 🎉</p>
        <p>Select a friend to start chatting</p>
      </div>
    );
  }

  const isSendDisabled =
    !inputValue.trim() && selectedFiles.length === 0;

  return (
    <div className="chat-container">
      {/* Messages area – in a dedicated component */}
      <div className="chat-messages-wrapper" id="chat-scroll-container">
        <Messages/>
      </div>

      {/* Input zone */}
      <form className="chat-input-wrapper">
        {/* Attachments preview (WhatsApp-style chips above input) */}
        {selectedFiles.length > 0 && (
          <div className="chat-attachments-preview">
            {selectedFiles.map((file, idx) => (
              <div key={`${file.name}-${idx}`} className="chat-attachment-chip">
                <span className="chat-attachment-name">
                  {file.name}
                </span>
                <button
                  type="button"
                  className="chat-attachment-remove"
                  onClick={() => handleRemoveFile(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main input row – button stays pinned, textarea grows up */}
        <div className="chat-input-row">
          <button
            type="button"
            style={{marginBottom: 7}}
            className="chat-icon-btn"
            onClick={handleFileButtonClick}
          >
            <AttachFileIcon fontSize="small" />
          </button>

          <button
            type="button"
            style={{marginBottom: 7}}
            className={`chat-icon-btn ${
              showEmojiPicker ? "chat-icon-btn-active" : ""
            }`}
            onClick={handleToggleEmojiPicker}
          >
            <InsertEmoticonIcon fontSize="small" />
          </button>

          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={onEnterSend}
          />

          <button
            type="submit"
            style={{marginBottom: 7}}
            className="chat-send-btn"
            disabled={isSendDisabled}
            onClick={handleSubmit}            
          >
            <SendIcon sx={{ height: "20px" }} />
          </button>
        </div>

        {/* Simple emoji picker (no extra libs) */}
        {showEmojiPicker && (
          <div className="chat-emoji-picker">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="chat-emoji-btn"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Hidden file input for Attach button */}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="chat-file-input-hidden"
        />
      </form>
    </div>
  );
};

export default Chat;
