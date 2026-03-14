// src/components/users/User.jsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";

import { getAll } from "../../../services/crud/crud";

import useChats from "../../../hooks/useChats";
import useAuth from "../../../hooks/useAuth";

import Avatar from "@mui/material/Avatar";

const CHAT_URL = "/chats/byParticipants";

const pageWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px 0px",
  boxSizing: "border-box",
};

const cardStyle = {
  maxWidth: "420px",
  width: "100%",
  background: "rgba(15, 23, 42, 0.96)", // slightly transparent dark
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 18px 35px rgba(0, 0, 0, 0.55)",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  color: "#e5e7eb",
  boxSizing: "border-box",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "20px",
};

const avatarWrapperStyle = {
  width: "88px",
  height: "88px",
  borderRadius: "999px",
  overflow: "hidden",
  border: "2px solid rgba(96, 165, 250, 0.6)",
  boxShadow: "0 0 0 4px rgba(30, 64, 175, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(6, 182, 212, 0.25))",
};

const avatarImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const avatarInitialsStyle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#0f172a",
};

const headerTextWrapperStyle = {
  marginLeft: "18px",
  flex: 1,
  minWidth: 0,
};

const nameStyle = {
    fontSize: "22px",
    fontWeight: 600,
    margin: 0,
    marginBottom: "4px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
};

const usernameStyle = {
  fontSize: "14px",
  opacity: 0.8,
  margin: 0,
  marginBottom: "6px",
};

const statusRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const statusTextStyle = {
  fontSize: "13px",
  textTransform: "capitalize",
  opacity: 0.9,
};

const badgeStyle = {
  marginLeft: "auto",
  fontSize: "11px",
  padding: "4px 9px",
  borderRadius: "999px",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  background: "rgba(15, 23, 42, 0.9)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#9ca3af",
};

const sectionStyle = {
  marginTop: "18px",
  paddingTop: "14px",
  borderTop: "1px solid rgba(31, 41, 55, 0.9)",
};

const sectionTitleStyle = {
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#9ca3af",
  margin: 0,
  marginBottom: "10px",
};

const metaRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "14px",
  marginBottom: "6px",
};

const metaLabelStyle = {
  opacity: 0.75,
};

const metaValueStyle = {
  fontWeight: 500,
};

const footerStyle = {
  marginTop: "22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
};

const backButtonStyle = {
  padding: "8px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(148, 163, 184, 0.5)",
  background: "transparent",
  color: "#e5e7eb",
  fontSize: "13px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

const messageButtonStyle = {
  padding: "9px 16px",
  borderRadius: "999px",
  border: "none",
  background:
    "linear-gradient(135deg, rgb(59, 130, 246), rgb(56, 189, 248))",
  color: "#0b1120",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 10px 20px rgba(56, 189, 248, 0.5)",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const emptyStateStyle = {
  ...cardStyle,
  textAlign: "center",
  alignItems: "center",
  justifyContent: "center",
  display: "flex",
  flexDirection: "column",
};

const emptyTextStyle = {
  fontSize: "14px",
  opacity: 0.8,
};

function getInitials(firstName, lastName) {
  const first = firstName?.[0] ?? "";
  const last = lastName?.[0] ?? "";
  const initials = (first + last).toUpperCase();
  return initials || "?";
}



const User = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { auth } = useAuth();
  const {chat, setChat, onSelectFriend} = useChats();
  const { userName: userNameParam } = useParams();

  // The user object passed from navigation state
  const user = location.state?.user;
  const areFriends = location.state?.areFriends || 1;


  const fetchChat = async () => {
    try {
      if(areFriends === 3) {
        const params = {
          userIds: [auth.user?._id, user._id]
        }
        const response = await getAll(CHAT_URL, params, auth.accessToken);
        if(response.data && response.data?.length === 1) {
          setChat(response.data[0]);          
          onSelectFriend({ participants: [auth.user, user] });
          console.log(`USER FETCH CHAT SET CHAT`, response.data[0]);
          navigate('/');
        }
      }          
    } catch (err){}
  }
  

  const formatDate = (dateString) => {
      if (!dateString) return "-a";
      try {
          const date = new Date(dateString);
          return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          });
      } catch {
          return dateString;
      }
  }


  const getDayKey = (dateStr) => {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 0-based
      const day = d.getDate();
      return `${year}-${month}-${day}`;
  };


  const memberSince = useMemo(() => {
      (user ? getDayKey(user.createdAt) : null)
  },[user]);


  const statusColor =
    user?.status === "online"
      ? "#22c55e"
      : user?.status === "away"
      ? "#eab308"
      : "#6b7280";

  const statusDotStyle = {
    width: "9px",
    height: "9px",
    borderRadius: "999px",
    backgroundColor: statusColor,
  };

  if (!user) {
    // No state passed (user refreshed the page or direct URL access)
    // In a real app, you’d probably fetch user data here by userNameParam.
    return (
      <div style={pageWrapperStyle}>
        <div style={emptyStateStyle}>
          <p style={emptyTextStyle}>
            No user data available. Try going back and opening this profile
            again.
          </p>
          <button
            type="button"
            style={backButtonStyle}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  const avatarSrc =
    user.profilePicture && user.profilePictureMimeType
      ? `data:${user.profilePictureMimeType};base64,${user.profilePicture}`
      : null;

  return (
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>
        {/* HEADER */}
        <div style={headerStyle}>
          <div style={avatarWrapperStyle}>
            {avatarSrc ? (
              <Avatar
                src={avatarSrc}
                alt={fullName || user.userName}
                style={avatarImageStyle}
              />
            ) : (
              <span style={avatarInitialsStyle}>
                {getInitials(user.firstName, user.lastName)}
              </span>
            )}
          </div>

          <div style={headerTextWrapperStyle}>
            <b style={nameStyle}>{fullName || user.userName}</b>
            <p style={usernameStyle}>@{user.userName}</p>

            <div style={statusRowStyle}>
              <span style={statusDotStyle} />
              <span style={statusTextStyle}>
                {user.status ? user.status : "offline"}
              </span>
              {areFriends === 3 ? <span style={badgeStyle}>Friends</span>
              : 
              areFriends === 2 ? <span style={badgeStyle}>Sent</span>
              : <button style={badgeStyle}>Add friend</button>}
            </div>
          </div>
        </div>

        {/* ACCOUNT INFO */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Account</h2>
          {user.email && <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Email</span>
            <a style={{metaValueStyle, textDecoration: "none"}} href={`mailto:${user.email}`}>
                {user.email.slice(0, 3)}**@**{user.email.split("@")[1]}
                 {/*user._id.slice(0, 6)}…{user._id.slice(-4)*/}
            </a>
          </div>}
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Member since</span>
            <span style={metaValueStyle}>{user.createdAt}</span>
          </div>
          <div style={metaRowStyle}>
            {/* <span style={metaLabelStyle}>Current status</span> */}
            {/* <span style={metaValueStyle}>
              {user.status ? user.status : "offline"}
            </span> */}
          </div>
        </div>

        {/* FUTURE INFO / PLACEHOLDER */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Profile</h2>
          <p style={{ fontSize: "14px", opacity: 0.85, margin: 0 }}>
            This is {fullName || user.userName}&apos;s profile. Here you can
            later add more details like bio, mutual friends, last seen, and
            shared media.
          </p>
        </div>

        {/* FOOTER ACTIONS */}
        <div style={footerStyle}>
          <button
            type="button"
            style={backButtonStyle}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          { areFriends === 3 && 
          <button
            type="button"
            style={messageButtonStyle}
            onClick={() => {
              fetchChat();
            }}
          >
            Message {user.firstName || user.userName}
          </button>}
        </div>
      </div>
    </div>
  );
};

export default User;
