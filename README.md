


# 💬 Fullstack Chat Application (MERN Stack)

A real-time chat application built with MongoDB, Express, React, and Node.js featuring WebSocket communication, message queues, and scalable cluster architecture.

---

## 🎓 **New to This Project? Start Here!**

**Feeling overwhelmed?** We've got you covered! Choose your learning path:

### **📖 For Complete Beginners**
👉 **[QUICK_START.md](QUICK_START.md)** - Your first 30 minutes (Start here!)
- Understand the basic architecture in 30 minutes
- No coding required, just reading and visualizing
- Includes a simple 8-file roadmap

### **📁 Want to Know Where Everything Is?**
👉 **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete file organization guide
- Detailed breakdown of every folder and file
- Color-coded by importance (critical vs optional)
- Quick reference: "Where do I find X?"

### **📚 Want Step-by-Step Explanations?**
👉 **[LEARNING_GUIDE.md](LEARNING_GUIDE.md)** - Feature-by-feature walkthrough
- Trace complete features from UI to database
- Code snippets with explanations
- Progressive difficulty (5 features to master)

### **🔍 Want to Experiment and Code?**
👉 **[EXPLORATION_GUIDE.md](EXPLORATION_GUIDE.md)** - Hands-on experiments
- Add console.logs to trace flow
- Break features and fix them
- Coding challenges (beginner to advanced)

### **🎨 Want Visual Diagrams?**
👉 **[ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)** - Flow diagrams and charts
- Complete architecture visualizations
- Message flow diagrams
- Database schema relationships

---

## ✨ Features

- 💬 **Real-time messaging** with Socket.IO
- 👥 **Group chats** with admin controls
- 🔐 **Secure authentication** with JWT
- 🖼️ **Image uploads** via Cloudinary
- 🎨 **Modern UI** with TailwindCSS + DaisyUI
- ⚡ **Message queues** with Bull (Redis-backed)
- 🌐 **Cluster mode** for scalability
- 📡 **Redis Pub/Sub** for cross-server communication
- 🔄 **Typing indicators** and online status
- 💾 **MongoDB** for data persistence

---

## 🚀 Quick Setup

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Redis (for queues and pub/sub)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fullstack-chat-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies (if any)
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Setup environment variables**
   

4. **Start Redis** (required for queues and pub/sub)
   ```bash
   # Windows
   redis-server
   
   # macOS/Linux
   brew services start redis
   # or
   sudo service redis-server start
   ```

5. **Start the application**
   
   **Option 1: Development mode (separate terminals)**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Worker process
   cd backend
   npm run worker
   
   # Terminal 3: Frontend
   cd frontend
   npm run dev
   ```
   
   **Option 2: Production mode (cluster)**
   ```bash
   cd backend
   npm run build     # Build frontend
   npm start         # Start cluster
   ```

6. **Access the application**
   - Frontend: http://localhost:5173 (dev) or http://localhost:5000 (production)
   - Backend API: http://localhost:5000/api

---

## 📦 Tech Stack

### **Frontend**
- ⚛️ React 18 with Vite
- 🎨 TailwindCSS + DaisyUI
- 📦 Zustand (state management)
- 🔌 Socket.IO Client
- 📡 Axios (HTTP client)

### **Backend**
- 🚀 Node.js + Express
- 🔌 Socket.IO
- 📊 MongoDB + Mongoose
- 🔐 JWT Authentication
- 🐂 Bull (job queues)
- 📡 Redis (pub/sub & caching)
- ☁️ Cloudinary (file storage)

---

## 🏗️ Architecture Overview

```
Frontend (React)
    ↕ HTTP (REST API) + WebSocket (Socket.IO)
Backend (Express + Socket.IO)
    ↕ Queue Jobs (Bull)
Worker Processes
    ↕ Save to Database
MongoDB
    → Publish Events
Redis Pub/Sub
    → Broadcast to all servers
Socket.IO → Updates all connected clients
```

**For detailed architecture diagrams, see [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)**

---

## 📖 Project Structure

```
fullstack-chat-app/
├── backend/
│   ├── cluster.js              # Entry point (cluster mode)
│   ├── app.js                  # Express app configuration
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   ├── models/             # Database schemas
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth, validation
│   │   ├── lib/                # Utilities (socket, queue, redis)
│   │   └── workers/            # Background job processors
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # Main screens
│   │   ├── components/         # Reusable UI components
│   │   ├── store/              # Zustand state management
│   │   └── lib/                # Utilities
│   └── package.json
│
├── QUICK_START.md              # 30-minute beginner guide
├── LEARNING_GUIDE.md           # Feature-by-feature explanations
├── PROJECT_STRUCTURE.md        # File organization guide
├── EXPLORATION_GUIDE.md        # Hands-on experiments
└── ARCHITECTURE_DIAGRAMS.md    # Visual diagrams
```

---

## 🎯 Learning Roadmap

### **Week 1: Basics**
1. Read [QUICK_START.md](QUICK_START.md)
2. Understand [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
3. Trace "Send Message" flow in [LEARNING_GUIDE.md](LEARNING_GUIDE.md)

### **Week 2: Experiments**
1. Add console.logs ([EXPLORATION_GUIDE.md](EXPLORATION_GUIDE.md))
2. Try breaking features
3. Implement beginner challenges

### **Week 3: Features**
1. Study Login flow
2. Study Image upload
3. Study Group creation

### **Week 4: Advanced**
1. Understand Bull queues
2. Understand Redis pub/sub
3. Understand cluster architecture

---

## 🛠️ Development Scripts

### Backend
```bash
npm run dev         # Start with nodemon (auto-reload)
npm run worker      # Start worker process
npm start           # Start cluster (production)
npm run seed        # Seed database with test users
```

### Frontend
```bash
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

---

## 🐛 Common Issues & Solutions

### **Issue: "Cannot connect to MongoDB"**
- Check if MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env`

### **Issue: "Redis connection failed"**
- Start Redis: `redis-server`
- Check `REDIS_HOST` and `REDIS_PORT` in `.env`

### **Issue: "Messages not appearing in real-time"**
- Check if worker process is running
- Verify Socket.IO connection in browser console
- Check Redis pub/sub is working

### **Issue: "Image upload fails"**
- Verify Cloudinary credentials in `.env`
- Check file size limits

**For more debugging help, see [EXPLORATION_GUIDE.md](EXPLORATION_GUIDE.md)**

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💡 Tips for Learners

- ✅ **Don't try to understand everything at once**
- ✅ **Focus on ONE feature at a time**
- ✅ **Add console.logs liberally**
- ✅ **Use the browser DevTools**
- ✅ **Break things to understand them**
- ✅ **Draw diagrams on paper**
- ✅ **Ask questions (AI, Stack Overflow, Discord)**

---

## 🌟 Acknowledgments

Built with ❤️ using:
- [MERN Stack](https://www.mongodb.com/mern-stack)
- [Socket.IO](https://socket.io/)
- [Bull](https://github.com/OptimalBits/bull)
- [TailwindCSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)

---

## 📞 Support

- 📖 Read the guides in this repository
- 🐛 Open an issue for bugs
- 💬 Discussions for questions
- ⭐ Star this repo if it helped you learn!

**Happy coding! 🚀**
