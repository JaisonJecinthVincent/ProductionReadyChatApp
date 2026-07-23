# Start Full-Stack Chat Application

## ✅ Prerequisites
- Elasticsearch running: `docker ps` (should show elasticsearch container)
- MongoDB connected (already configured in .env)
- Redis running (if you have it, otherwise queuing will be disabled)

---

## 🚀 Start the Application

Open **3 separate PowerShell terminals** and run these commands:

### Terminal 1️⃣ - Backend Server
```powershell
cd E:\ChatAppWithMERN\fullstack-chat-app\backend
npm run dev
```
**Expected output:**
```
✅ Elasticsearch connected: green
✅ MongoDB connected
Server running on port 5000
Workers spawned: 4
```

---

### Terminal 2️⃣ - Message Worker  
```powershell
cd E:\ChatAppWithMERN\fullstack-chat-app\backend
npm run worker:messages
```
**Expected output:**
```
✅ Message worker started
✅ Connected to Redis
✅ Connected to MongoDB
Worker is ready to process messages
```

---

### Terminal 3️⃣ - Frontend
```powershell
cd E:\ChatAppWithMERN\fullstack-chat-app\frontend
npm run dev
```
**Expected output:**
```
VITE ready in XXms
Local: http://localhost:5173/
```

---

## 🔍 Search Features (Improved with N-Grams)

Your search now supports:

### Typing "h" will match:
- ✅ **"hi"** - starts with h (edge n-gram)
- ✅ **"hello"** - starts with h (edge n-gram)
- ✅ **"earth"** - contains h (n-gram)
- ✅ **"eahth"** - contains h (n-gram)

### Search strategies (prioritized):
1. **Exact phrase** (highest) - "hello world" matches exactly
2. **Prefix match** (high) - "h" matches "hello", "hi"
3. **Partial match** (medium) - "h" matches "earth", "path"
4. **Fuzzy match** (low) - handles typos like "helo" → "hello"

---

## 🧪 Test Search

1. Open frontend: http://localhost:5173
2. Login/signup
3. Send some test messages:
   - "hi there"
   - "hello world"
   - "the earth is round"
   - "find the path"
4. Type **"h"** in search → should see all 4 messages
5. Type **"hel"** → "hello" ranked higher than "earth"

---

## ⚠️ Troubleshooting

### Backend won't start:
- Check Elasticsearch: `docker ps`
- If stopped: `docker start elasticsearch`

### Search not working:
- Check backend logs for: `✅ Elasticsearch connected`
- Verify index: `curl http://localhost:9200/messages/_count`
- Reindex if needed: `node scripts/reindex-messages.js`

### Worker not processing:
- Check if Redis is running (optional, can work without it)
- Check worker logs for errors

---

## 🎯 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Elasticsearch**: http://localhost:9200
- **Elasticsearch Index Info**: http://localhost:9200/messages
