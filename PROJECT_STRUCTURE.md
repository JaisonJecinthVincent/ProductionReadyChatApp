# 📁 Project Structure Guide

## 🎯 Understanding the File Organization

**Don't try to read every file!** Focus on the **main flow** first.

---

## 🌟 **Files You MUST Understand (Core 15%)**

These files handle 80% of the app functionality:

### **Backend Core (5 files)**

```
backend/
├── cluster.js                          ⭐ START HERE - App entry point
├── app.js                              ⭐ Express setup, routes registration
└── src/
    ├── controllers/
    │   ├── auth.controller.js          ⭐ Login, signup, logout logic
    │   └── message.controller.js       ⭐ Send message logic
    ├── models/
    │   ├── user.model.js               ⭐ User database schema
    │   └── message.model.js            ⭐ Message database schema
    ├── routes/
    │   ├── auth.route.js               ⭐ Auth API endpoints
    │   └── message.route.js            ⭐ Message API endpoints
    ├── lib/
    │   ├── socket.js                   ⭐ WebSocket setup
    │   └── queue.js                    ⭐ Bull queue setup
    └── workers/
        └── messageWorker.js            ⭐ Process message jobs
```

### **Frontend Core (8 files)**

```
frontend/
├── src/
    ├── main.jsx                        ⭐ React entry point
    ├── App.jsx                         ⭐ Main app component, routing
    ├── store/
    │   ├── useAuthStore.js             ⭐ Login/logout state
    │   └── useChatStore.js             ⭐ Messages, send/receive
    ├── pages/
    │   ├── LoginPage.jsx               ⭐ Login UI
    │   └── HomePage.jsx                ⭐ Chat UI (main screen)
    └── components/
        ├── MessageInput.jsx            ⭐ Message input box
        └── ChatContainer.jsx           ⭐ Message display
```

**🎓 Learn these 15 files first!** Everything else is extra features.

---

## 📂 **Complete Backend Structure**

```
backend/
│
├── 🚀 Entry Points
│   ├── cluster.js                   # Starts multiple server processes (clustering)
│   ├── app.js                       # Express app setup (routes, middleware)
│   └── message-worker-process.js   # Separate process for Bull queue workers
│
├── 📋 Configuration
│   ├── package.json                 # Dependencies (express, socket.io, etc.)
│   ├── .env                         # Secret keys (MongoDB URL, JWT secret)
│   └── testENV.js                   # Check if .env is loaded correctly
│
├── 🛠️ Source Code (src/)
│   │
│   ├── 🎮 Controllers (Business Logic)
│   │   ├── auth.controller.js       # signup(), login(), logout(), updateProfile()
│   │   ├── message.controller.js    # sendMessage(), getMessages(), getUsersForSidebar()
│   │   └── group.controller.js      # createGroup(), sendGroupMessage(), getGroups()
│   │
│   ├── 🗄️ Models (Database Schemas)
│   │   ├── user.model.js            # User: email, password, profilePic, createdAt
│   │   ├── message.model.js         # Message: senderId, receiverId, text, image
│   │   └── group.model.js           # Group: name, members[], messages[], avatar
│   │
│   ├── 🛣️ Routes (API Endpoints)
│   │   ├── auth.route.js            # POST /api/auth/signup, /login, /logout
│   │   ├── message.route.js         # POST /api/messages/send/:id, GET /api/messages/:id
│   │   ├── group.route.js           # POST /api/groups, GET /api/groups
│   │   └── oauth.route.js           # GET /api/oauth/google, /oauth/github
│   │
│   ├── 🛡️ Middleware (Request Interceptors)
│   │   └── auth.middleware.js       # protectRoute() - Verify JWT token
│   │
│   ├── 🔧 Libraries (Utilities)
│   │   ├── db.js                    # connectDB() - MongoDB connection
│   │   ├── socket.js                # initializeSocket() - WebSocket setup
│   │   ├── queue.js                 # Bull queue initialization
│   │   ├── redis.js                 # Redis connection pool
│   │   ├── pubsub.js                # Redis pub/sub manager
│   │   ├── cloudinary.js            # Image upload configuration
│   │   └── utils.js                 # Helper functions
│   │
│   └── 🌱 Seeds (Test Data)
│       └── user.seed.js             # Create fake users for testing
│
├── ⚙️ Workers (Background Jobs)
│   ├── messageWorker.js             # Process message queue jobs
│   └── bcryptWorker.js              # Password hashing in separate thread
│
└── 📜 Scripts (Automation)
    ├── setup-oauth.js               # Setup Google/GitHub OAuth
    └── start-redis.js               # Start Redis server (Windows)
```

---

## 📂 **Complete Frontend Structure**

```
frontend/
│
├── 🚀 Entry Points
│   ├── index.html                   # HTML template
│   ├── main.jsx                     # React initialization, renders App.jsx
│   └── App.jsx                      # Main component, routing setup
│
├── 📋 Configuration
│   ├── package.json                 # Dependencies (react, zustand, socket.io-client)
│   ├── vite.config.js               # Vite bundler config (dev server)
│   ├── tailwind.config.js           # TailwindCSS styles
│   └── eslint.config.js             # Code quality rules
│
├── 🎨 Source Code (src/)
│   │
│   ├── 📄 Pages (Main Screens)
│   │   ├── HomePage.jsx             # Chat interface (sidebar + messages)
│   │   ├── LoginPage.jsx            # Login form
│   │   ├── SignUpPage.jsx           # Signup form
│   │   ├── ProfilePage.jsx          # User profile settings
│   │   ├── SettingsPage.jsx         # App settings (theme, etc.)
│   │   └── OAuthCallback.jsx        # Handle Google/GitHub login redirect
│   │
│   ├── 🧩 Components (Reusable UI)
│   │   ├── Navbar.jsx               # Top navigation bar
│   │   ├── Sidebar.jsx              # User list, group list
│   │   ├── ChatContainer.jsx        # Message display area
│   │   ├── MessageInput.jsx         # Message input box + send button
│   │   ├── ChatHeader.jsx           # Chat header (user info, options)
│   │   ├── CreateGroupModal.jsx     # Popup to create group
│   │   ├── OAuthLogin.jsx           # Google/GitHub login buttons
│   │   ├── OAuthAccountManager.jsx  # Manage linked accounts
│   │   ├── NoChatSelected.jsx       # Placeholder when no chat selected
│   │   ├── AuthImagePattern.jsx     # Decorative background pattern
│   │   └── skeletons/
│   │       ├── MessageSkeleton.jsx  # Loading placeholder for messages
│   │       └── SidebarSkeleton.jsx  # Loading placeholder for sidebar
│   │
│   ├── 💾 Store (State Management - Zustand)
│   │   ├── useAuthStore.js          # Login state, socket connection
│   │   ├── useChatStore.js          # Messages, selected user, send/receive
│   │   └── useThemeStore.js         # Dark mode, theme colors
│   │
│   ├── 🔧 Lib (Utilities)
│   │   ├── axios.js                 # HTTP client setup (API calls)
│   │   └── utils.js                 # Helper functions
│   │
│   ├── 🎨 Styles
│   │   └── index.css                # Global CSS, TailwindCSS imports
│   │
│   └── 📊 Constants
│       └── index.js                 # App constants (themes, etc.)
│
└── 📁 Public (Static Assets)
    ├── avatar.png                   # Default avatar image
    └── vite.svg                     # App icon
```

---

## 🎯 **File Categories by Importance**

### **🔴 Critical (Must Understand)**
Files that handle core functionality:
- `backend/cluster.js` - App starts here
- `backend/app.js` - Routes registration
- `backend/src/controllers/*.js` - All business logic
- `backend/src/models/*.js` - Database structure
- `frontend/src/store/*.js` - App state
- `frontend/src/pages/HomePage.jsx` - Main UI

### **🟡 Important (Understand Later)**
Files that add important features:
- `backend/src/lib/socket.js` - Real-time communication
- `backend/src/lib/queue.js` - Background jobs
- `backend/workers/messageWorker.js` - Job processing
- `frontend/src/components/MessageInput.jsx` - Input handling
- `frontend/src/components/ChatContainer.jsx` - Message display

### **🟢 Nice to Know**
Files that add polish:
- `backend/src/lib/pubsub.js` - Redis pub/sub
- `backend/src/middleware/auth.middleware.js` - Security
- `frontend/src/components/CreateGroupModal.jsx` - Group creation
- `frontend/src/store/useThemeStore.js` - Theme switching

### **⚪ Optional (Ignore for Now)**
Files you can safely ignore:
- `backend/scripts/*` - Automation tools
- `backend/seeds/*` - Test data generation
- `frontend/src/components/skeletons/*` - Loading animations
- `*.config.js` - Build configuration
- `*.md` - Documentation

---

## 🔍 **How to Navigate the Codebase**

### **To understand a feature, follow this order:**

1. **Find the UI trigger** (button, form, etc.)
   - Example: "Send message" button in `MessageInput.jsx`

2. **Find the event handler** (onClick, onSubmit)
   - Example: `handleSendMessage()` function

3. **Find the store function** (Zustand action)
   - Example: `useChatStore.sendMessage()`

4. **Find the API call** (HTTP request)
   - Example: `axiosInstance.post('/messages/send/:id')`

5. **Find the backend route** (Express route)
   - Example: `routes/message.route.js`

6. **Find the controller** (Business logic)
   - Example: `controllers/message.controller.js`

7. **Find the model** (Database operation)
   - Example: `Message.create()`

8. **Find the response handler** (Update UI)
   - Example: `socket.on('newMessage')` → Update state

---

## 📊 **Data Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                                                             │
│  User Interaction                                           │
│       ↓                                                     │
│  Component (MessageInput.jsx)                               │
│       ↓                                                     │
│  Event Handler (handleSendMessage)                          │
│       ↓                                                     │
│  Zustand Store (useChatStore.sendMessage)                   │
│       ↓                                                     │
│  HTTP Request (axios.post)                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (HTTP)
┌──────────────────────┴──────────────────────────────────────┐
│                        BACKEND                              │
│                                                             │
│  Express Route (message.route.js)                           │
│       ↓                                                     │
│  Middleware (protectRoute - check auth)                     │
│       ↓                                                     │
│  Controller (message.controller.sendMessage)                │
│       ↓                                                     │
│  Bull Queue (add job)                                       │
│       ↓                                                     │
│  HTTP Response (202 Accepted)                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (Queue)
┌──────────────────────┴──────────────────────────────────────┐
│                    WORKER PROCESS                           │
│                                                             │
│  messageWorker.processDirectMessage()                       │
│       ↓                                                     │
│  Save to MongoDB (Message.create)                           │
│       ↓                                                     │
│  Upload to Cloudinary (if image)                            │
│       ↓                                                     │
│  Publish to Redis (pub/sub)                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (Pub/Sub)
┌──────────────────────┴──────────────────────────────────────┐
│                 BACKEND (Main Server)                       │
│                                                             │
│  PubSubManager.handleNewMessage()                           │
│       ↓                                                     │
│  Socket.IO emit (io.to().emit('newMessage'))                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (WebSocket)
┌──────────────────────┴──────────────────────────────────────┐
│                        FRONTEND                             │
│                                                             │
│  Socket.IO Listener (socket.on('newMessage'))               │
│       ↓                                                     │
│  Update Zustand State (set({ messages: [...] }))            │
│       ↓                                                     │
│  React Re-render (ChatContainer.jsx)                        │
│       ↓                                                     │
│  User Sees Message! ✨                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Quick Reference: Where to Find Things**

| What You Want to Do | File to Edit |
|---------------------|--------------|
| Change login form UI | `frontend/src/pages/LoginPage.jsx` |
| Change login logic | `backend/src/controllers/auth.controller.js` |
| Add new API endpoint | `backend/src/routes/*.route.js` |
| Change message display | `frontend/src/components/ChatContainer.jsx` |
| Change database schema | `backend/src/models/*.model.js` |
| Add new state | `frontend/src/store/*.js` |
| Change WebSocket events | `backend/src/lib/socket.js` |
| Add new queue job | `backend/src/lib/queue.js` |
| Process new job type | `backend/workers/messageWorker.js` |
| Change app theme | `frontend/src/store/useThemeStore.js` |

---

## 💡 **Pro Tips for Navigating**

1. **Use VS Code Search:**
   - `Ctrl + P` - Quick open file by name
   - `Ctrl + Shift + F` - Search across all files
   - `F12` - Go to definition
   - `Shift + F12` - Find all references

2. **Follow the imports:**
   - If you see `import { sendMessage } from '../store/useChatStore'`
   - Click on it or `F12` to jump to the file

3. **Use the file explorer patterns:**
   - Controllers = business logic
   - Models = database structure
   - Routes = API endpoints
   - Components = UI pieces
   - Store = app state

4. **Start from the UI:**
   - Find the button/form in `components/` or `pages/`
   - Trace the function calls backward

---

## 🚀 **Next Steps**

1. ✅ **Read this structure guide** (You're doing it!)
2. ✅ **Open `LEARNING_GUIDE.md`** (Step-by-step feature tracing)
3. ✅ **Pick ONE feature to understand** (Start with "Send message")
4. ✅ **Open those 8-10 files** (Don't read everything, just the relevant functions)
5. ✅ **Add console.log() everywhere** (See the data flow)

**Don't try to understand all 50+ files!** Focus on the **15 core files** first.

You got this! 💪
