# 💬 Fullstack Real-Time Chat Application

A full-stack, real-time chat application built with **React**, **Node.js/Express**, **Socket.IO**, and **MongoDB**. The project demonstrates production-grade architectural patterns including cursor-based pagination, JWT authentication over WebSockets, real-time friend-request flows, and a clean separation of concerns across client and server layers.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
  - [Authentication](#-authentication)
  - [Real-Time Messaging](#-real-time-messaging)
  - [Chat Management](#-chat-management)
  - [Friend System](#-friend-system)
  - [User Profiles](#-user-profiles)
  - [UI & Experience](#-ui--experience)
- [Project Structure](#project-structure)
  - [Client](#client-react--vite)
  - [Server](#server-nodejs--express)
- [API Overview](#api-overview)
- [Data Models](#data-models)
- [Getting Started](#getting-started)
- [Known Limitations & Incomplete Features](#-known-limitations--incomplete-features)
- [Author](#author)

---

## Overview

This application provides a WhatsApp/Telegram-style chat experience in the browser. Users can register, log in, send friend requests, and exchange real-time messages with their contacts. The backend exposes a RESTful HTTP API for CRUD operations and a Socket.IO layer for all real-time events.

The project is intentionally built **without a UI framework like Next.js** to keep the architecture transparent and demonstrate low-level React patterns (Context, Reducer, custom hooks, infinite scroll).

---

## Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| Frontend   | React 19, Vite 6, React Router v7              |
| UI Library | MUI (Material UI v7), FontAwesome              |
| Real-time  | Socket.IO client v4                            |
| HTTP       | Axios                                          |
| Backend    | Node.js, Express 4                             |
| Real-time  | Socket.IO server v4                            |
| Database   | MongoDB via Mongoose 8                         |
| Auth       | JSON Web Tokens (JWT), bcrypt                  |
| File I/O   | Multer (file uploads), node-cron (cleanup job) |
| Dev Tools  | Nodemon, ESLint, Vite HMR                      |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Client (React)              │
│                                             │
│  Pages: Welcome → Login/Register → Home     │
│  ├── RecentChats (infinite scroll)          │
│  ├── Chat (message thread + send bar)       │
│  ├── Friends (infinite scroll)              │
│  └── FriendRequests                         │
│                                             │
│  Providers: Auth · Socket · Chats · Theme   │
│  Custom Hooks: useAuth, useSocket,          │
│                useChats, useFriendRequests  │
└──────────────┬──────────────────────────────┘
               │  HTTP (REST)   │  WebSocket (Socket.IO)
               ▼                ▼
┌─────────────────────────────────────────────┐
│                  Server (Express)            │
│                                             │
│  Routers → Controllers → Services           │
│  ├── /auth        authController            │
│  ├── /users       usersController           │
│  ├── /friendsReq  friendsReqController      │
│  ├── /chats       chatsController           │
│  └── /messages    messagesController        │
│                                             │
│  Socket.IO events:                          │
│  sendMessage · sendFriendRequest            │
│  acceptFriendRequest · deleteFriendRequest  │
│                                             │
│  Middleware: JWT auth (HTTP + WS)           │
│  Cron: daily file cleanup                   │
└──────────────┬──────────────────────────────┘
               ▼
         MongoDB (Mongoose)
         Users · Chats · Messages · FriendReqs
```

---

## Features

### 🔐 Authentication

| Feature | Status | Notes |
|---|---|---|
| User registration with profile picture upload | ✅ Done | Base64 stored in MongoDB |
| Login with email + password | ✅ Done | Returns JWT in response body and `Authorization` header |
| Password hashing with bcrypt | ✅ Done | |
| JWT-based auth for REST API | ✅ Done | Auto-refreshes token on each authenticated request |
| JWT-based auth for Socket.IO connections | ✅ Done | Verified in the `io.use()` middleware before connection |
| Logout + online/offline status update | ✅ Done | Sets `lastSeen` timestamp on logout |
| Protected routes (client-side) | ✅ Done | `RequireAuth` wrapper component |
| Persistent login session (refresh tokens) | ❌ Not implemented | Token is stored in memory only; page refresh requires re-login |

---

### ⚡ Real-Time Messaging

| Feature | Status | Notes |
|---|---|---|
| Send & receive messages in real-time | ✅ Done | Via `sendMessage` / `newMessage` Socket.IO events |
| Sender acknowledgment callback | ✅ Done | Server calls the Socket.IO callback with the persisted message |
| Real-time delivery to online recipients | ✅ Done | Uses an in-memory `onlineSockets` map |
| Chat list auto-updates on new message | ✅ Done | Last-message preview and timestamp refresh live |
| Message history with cursor-based pagination | ✅ Done | Infinite scroll, loads 20 messages at a time |
| Message read receipts (status field in schema) | ⚠️ Partial | `status` field (1/2/3) exists in the `Message` model and schema, but **read-receipt logic is not implemented** on either client or server |
| Message editing | ⚠️ Partial | `edited` and `editedAt` fields exist in the schema, but **edit flow is not implemented** |
| Message deletion | ❌ Not implemented | |
| Typing indicators | ❌ Not implemented | |
| File/media attachments in messages | ❌ Not implemented | `filesPath` field exists in the schema; Multer middleware is configured, but attachment sending is not wired up |
| Reply-to / thread messages | ⚠️ Partial | `repliedTo` field exists in the schema; **UI and server logic are not implemented** |
| Message search | ✅ Done | Server supports `q` query param to search by content or sender username |

---

### 💬 Chat Management

| Feature | Status | Notes |
|---|---|---|
| Direct (1-on-1) chats | ✅ Done | Auto-created when two users start chatting |
| Group chats (data model) | ⚠️ Partial | `Chat` schema supports `type: 'group'`, `name`, `description`, `photo`, and `groupManagers`. REST endpoint supports creating group chats. **Client UI for group chats is not implemented** |
| Deduplicated direct chats | ✅ Done | Pre-save hook normalises participant order; duplicate check prevents double-creation |
| Recent chats list with infinite scroll | ✅ Done | Cursor-based pagination, sorted by `updatedAt` descending |
| Last-message preview in chat list | ✅ Done | |
| Unread message count badge | ⚠️ Partial | `unread` field exists in `Chat` schema; **badge is conditionally rendered in the UI but the count is never populated by the server** |
| Chat search | ✅ Done | Server supports `q` query param for chat name filtering |

---

### 👥 Friend System

| Feature | Status | Notes |
|---|---|---|
| Send friend requests (real-time) | ✅ Done | Emitted over Socket.IO; recipient receives a live notification if online |
| Accept friend requests (real-time) | ✅ Done | Requester notified live via `friendRequestAccepted` event |
| Delete / withdraw friend requests | ✅ Done | Both parties notified via `friendRequestDeleted` event |
| Reject friend requests (HTTP) | ✅ Done | Sets status to `"declined"` |
| Spam protection | ✅ Done | Blocks re-sending if a pending/accepted request exists; limits declined re-sends to 3 |
| Friends list with infinite scroll | ✅ Done | Cursor-based, filterable |
| Remove an existing friend | ❌ Not implemented | |
| Block / unblock users | ⚠️ Partial | `blocked` array exists in the `User` schema; **no API or UI logic is implemented** |

---

### 👤 User Profiles

| Feature | Status | Notes |
|---|---|---|
| Profile page (`/users/:username`) | ✅ Done | Shows user info; navigated to from the friends list |
| Search users by username / name | ✅ Done | Case-insensitive regex search on the server |
| Profile picture upload on register | ✅ Done | Multer handles the `multipart/form-data`; stored as Base64 in MongoDB |
| Edit profile | ⚠️ Partial | `updateUser` endpoint exists and validates input; **client-side edit form is not implemented** |
| Online / offline status indicator | ✅ Done | Status dot rendered in chat header and friends list |
| Last-seen timestamp | ✅ Done | Set on logout; stored in the `User` document |
| Phone number field | ⚠️ Partial | Field exists in `User` schema; **not exposed in registration or profile UI** |

---

### 🎨 UI & Experience

| Feature | Status | Notes |
|---|---|---|
| Dark / light theme toggle | ✅ Done | `AppThemeProvider` context; persisted per session |
| Infinite scroll — chats, friends, messages | ✅ Done | `react-infinite-scroll-component` with cursor-based backend pagination |
| Loading spinner during async fetches | ✅ Done | FontAwesome `faSpinner` with spin animation |
| Error messages via SweetAlert2 | ✅ Done | Used for form errors and notifications |
| MUI component library | ✅ Done | Avatars, badges, icons |
| Responsive / mobile layout | ❌ Not implemented | Layout is desktop-only |
| Notifications panel / dropdown | ⚠️ Partial | `FriendRequests` page exists; **a dedicated in-app notifications component is not built** |
| Welcome / landing page | ✅ Done | Shown to unauthenticated users |

---

## Project Structure

### Client (React + Vite)

```
Client/
├── src/
│   ├── api/                  # Axios instance configuration
│   ├── components/
│   │   ├── auth/             # RequireAuth guard
│   │   ├── chat/             # Chat.jsx, RecentChats.jsx
│   │   ├── friends/          # Friends.jsx (infinite scroll list)
│   │   ├── messages/         # Messages.jsx, SendMessage.jsx
│   │   ├── notifications/    # Friend-request notification UI
│   │   ├── shared/           # Shared / reusable components
│   │   └── users/            # Users search, User profile
│   ├── context/
│   │   ├── AuthProvider.jsx       # Auth state & accessToken
│   │   ├── SocketProvider.jsx     # Socket.IO connection management
│   │   ├── ChatsProvider.jsx      # Active chat, messages (useReducer)
│   │   ├── friendRequestsProvider.jsx
│   │   ├── AppThemeProvider.jsx   # Dark/light mode
│   │   └── messagesReducer.js     # Message actions: SET, APPEND, ADD, RESET
│   ├── hooks/                # useAuth, useSocket, useChats, useFriendRequests, useAppTheme
│   ├── pages/
│   │   ├── auth/             # Login.jsx
│   │   ├── homePage/         # HomePage.jsx (main shell)
│   │   ├── user/             # Register.jsx
│   │   ├── friendRequests/   # FriendRequests.jsx
│   │   └── welcomePage/      # WelcomePage.jsx
│   ├── routes/               # MainRoutes.jsx
│   └── services/
│       ├── auth/             # Login / logout API calls
│       ├── crud/             # Generic getAll, getById, post, put, delete
│       ├── socketServices/   # Socket event emitters
│       └── user/             # User-specific API helpers
└── vite.config.js
```

### Server (Node.js + Express)

```
Server/
├── app.js                    # Express app, Socket.IO setup, router mounting, cron init
└── src/
    ├── configs/
    │   └── db.js             # Mongoose connection
    ├── controllers/
    │   ├── authController.js         # login, logOut
    │   ├── chatsController.js        # getChats, getChatsByParticipants, createChat
    │   ├── messagesController.js     # getMessages (HTTP), handleSendMessage (Socket.IO)
    │   ├── friendsReqcontroller.js   # CRUD + Socket.IO friend-request handlers
    │   └── usersController.js        # getAllUsers, getUserById, createUser, updateUser, deleteUser, getUsersFriends
    ├── crons/
    │   └── deleteFileWeekOldCron.js  # Daily cleanup of uploaded files older than 7 days
    ├── middlewares/
    │   ├── auth-middleware.js        # JWT validation for HTTP and Socket.IO
    │   └── multer-middleware.js      # File upload handling
    ├── models/
    │   ├── userModel.js              # User schema
    │   ├── chatModel.js              # Chat schema (direct + group)
    │   ├── messageModel.js           # Message schema
    │   └── friendReqModel.js         # FriendRequest schema
    ├── repositories/                 # Data-access layer (wraps Mongoose queries)
    ├── routers/                      # Express routers per domain
    ├── services/                     # Business-logic layer
    └── utils/
        ├── jwt.js                    # generateToken, verifyToken, refreshToken
        ├── validators.js             # Input validation
        ├── password.js               # bcrypt helpers
        └── onlineSockets.js          # In-memory Map: userId → socketId
```

---

## API Overview

All protected routes require an `Authorization: Bearer <token>` header.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/auth/login` | No | Login; returns user + JWT |
| `POST` | `/auth/logout` | Yes | Logout; sets user offline |
| `POST` | `/users` | No | Register new user (multipart/form-data) |
| `GET` | `/users` | Yes | Search users by name/username |
| `GET` | `/users/:id` | Yes | Get user by ID |
| `GET` | `/users/active/:id` | Yes | Get full active user profile |
| `GET` | `/users/friends/:id` | Yes | Get paginated friends list (cursor-based) |
| `PUT` | `/users/:id` | Yes | Update user profile |
| `DELETE` | `/users/:id` | Yes | Delete user |
| `GET` | `/chats` | Yes | Get paginated chats for a user (cursor-based) |
| `GET` | `/chats/by-participants` | Yes | Get or create a chat by participant IDs |
| `POST` | `/chats` | Yes | Create a new direct or group chat |
| `GET` | `/messages` | Yes | Get paginated messages for a chat (cursor-based) |
| `GET` | `/friendsReq` | Yes | Get incoming friend requests |
| `GET` | `/friendsReq/sent` | Yes | Get sent friend requests |
| `PUT` | `/friendsReq/reject` | Yes | Reject a friend request |

**Socket.IO events (client → server):**

| Event | Payload | Description |
|-------|---------|-------------|
| `sendMessage` | `{ chatId, users: { senderId, recieverId }, message }` | Send a text message |
| `sendFriendRequest` | `{ requester, recipient }` | Send a friend request |
| `acceptFriendRequest` | Friend-request document | Accept a pending request |
| `deleteFriendRequest` | `{ id }` | Delete / withdraw a request |

**Socket.IO events (server → client):**

| Event | Description |
|-------|-------------|
| `newMessage` | Delivered to the recipient if online |
| `newFriendRequest` | Delivered to the recipient in real-time |
| `friendRequestAccepted` | Delivered to the requester |
| `friendRequestDeleted` | Delivered to both parties |
| `newFriendRequestError` | Error feedback to the sender |

---

## Data Models

### User
```
firstName, lastName, userName (unique), email (unique), phoneNumber,
password (bcrypt), friends: [User], blocked: [User],
profilePicture (base64), profilePictureMimeType,
status: "online" | "offline", createdAt, lastSeen
```

### Chat
```
type: "direct" | "group",
participants: [User],
groupManagers: [User],   // group only
name, description, photo, photoMimeType,  // group only
unread: [{ user, count, lastReadAt }],
lastMessage: Message, lastMessageAt, createdAt, updatedAt
```

### Message
```
chatId: Chat, messageFrom: User, messageTo: User,
content: String,
repliedTo: Message,       // reply threading (schema only)
filesPath: [String],      // attachments (schema only)
status: 1 | 2 | 3,       // sent/delivered/read (schema only)
edited: Boolean, editedAt: Date, createdAt
```

### FriendRequest
```
requester: User, recipient: User,
status: "pending" | "accepted" | "declined"
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB instance (local or Atlas)

### Server

```bash
cd Server
npm install

# Create a .env file:
# MONGO_URI=mongodb://...
# JWT_SECRET=your_secret

npm run dev        # starts with nodemon on http://localhost:3000
```

### Client

```bash
cd Client
npm install
npm run dev        # starts Vite dev server on http://localhost:5173
```

---

## ⚠️ Known Limitations & Incomplete Features

The following items are scaffolded (data model or partial backend exists) but are **not fully implemented**:

| Area | What's Missing |
|------|----------------|
| **Message read receipts** | `status` field (1=sent, 2=delivered, 3=read) exists in schema but no logic updates it |
| **Message editing** | `edited` / `editedAt` fields exist; no edit endpoint or UI |
| **Message deletion** | No endpoint or UI |
| **Reply / thread messages** | `repliedTo` field exists; no server logic or UI |
| **File attachments in messages** | `filesPath` array and Multer exist; not wired to the send-message flow |
| **Group chat UI** | Server fully supports group chats; client has no group creation or management screens |
| **Unread message counts** | `unread` array in Chat schema exists; server never populates it |
| **Block / unblock users** | `blocked` array in User schema exists; no API or UI |
| **Remove friend** | No endpoint or UI |
| **Edit profile** | `PUT /users/:id` exists; no client-side form |
| **Persistent sessions** | JWT is in-memory only; page refresh logs the user out |
| **Responsive / mobile layout** | Desktop layout only |
| **Typing indicators** | Not implemented |
| **Push / browser notifications** | Not implemented |
| **Phone number** | Field in schema; not exposed in forms |

---

## Author

**Yakov Sviazov**  
Full-Stack Developer

---

> *This project is a work in progress. The focus has been on building a solid real-time foundation — authentication, WebSocket communication, and cursor-based pagination — with room to expand features iteratively.*
