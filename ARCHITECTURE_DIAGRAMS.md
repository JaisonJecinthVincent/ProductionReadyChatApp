# 🎨 Visual Architecture Diagrams

## 📊 Understanding Through Pictures

**Sometimes one diagram is worth a thousand lines of code!**

---

## 🏗️ **Overall Architecture (Bird's Eye View)**

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   REACT APPLICATION                        │  │
│  │                                                            │  │
│  │  Components:  MessageInput │ ChatContainer │ Sidebar      │  │
│  │  State:       Zustand (useAuthStore, useChatStore)        │  │
│  │  Styling:     TailwindCSS + DaisyUI                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│         │                                             │          │
│         │ HTTP (REST API)                    WebSocket│          │
│         │ axios.post()                      Socket.IO │          │
└─────────┼─────────────────────────────────────────────┼─────────┘
          │                                             │
          ↓                                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER (Node.js)                   │
│  ┌──────────────────┐                    ┌──────────────────┐   │
│  │  HTTP LAYER      │                    │  WEBSOCKET LAYER │   │
│  │  (Express.js)    │                    │  (Socket.IO)     │   │
│  │                  │                    │                  │   │
│  │  Routes          │                    │  Event Handlers  │   │
│  │  ↓               │                    │  ↓               │   │
│  │  Middleware      │                    │  Room Management │   │
│  │  ↓               │                    │  ↓               │   │
│  │  Controllers ────┼────────┐           │  Emit Events     │   │
│  │                  │        │           │                  │   │
│  └──────────────────┘        │           └──────────────────┘   │
│                              │                    ↑              │
│                              ↓                    │              │
│                    ┌──────────────────┐           │              │
│                    │   BULL QUEUE     │           │              │
│                    │   (Redis-backed) │           │              │
│                    └──────────────────┘           │              │
│                              │                    │              │
└──────────────────────────────┼────────────────────┼──────────────┘
                               │                    │
                               ↓                    ↓
┌──────────────────────────────────────────────────────────────────┐
│                     WORKER PROCESS                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  messageWorker.processDirectMessage()                      │  │
│  │                                                             │  │
│  │  1. Save to MongoDB                                        │  │
│  │  2. Upload images to Cloudinary                            │  │
│  │  3. Publish to Redis Pub/Sub ─────────────┐                │  │
│  └────────────────────────────────────────────┼───────────────┘  │
└────────────────────────────────────────────────┼──────────────────┘
                                                 │
                                                 ↓
┌──────────────────────────────────────────────────────────────────┐
│                   REDIS PUB/SUB                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Channels: 'new_message', 'group_message'                  │  │
│  │                                                             │  │
│  │  PubSubManager subscribes ───────────────┐                 │  │
│  └──────────────────────────────────────────┼─────────────────┘  │
└──────────────────────────────────────────────┼──────────────────┘
                                               │
                                               ↓
                              ┌────────────────────────────┐
                              │  Socket.IO emits event     │
                              │  to connected clients      │
                              └────────────────────────────┘
                                               │
                        ┌──────────────────────┴──────────────────┐
                        ↓                                         ↓
                 ┌─────────────┐                          ┌─────────────┐
                 │  Sender's   │                          │  Receiver's │
                 │  Browser    │                          │  Browser    │
                 └─────────────┘                          └─────────────┘
                        │                                         │
                        ↓                                         ↓
                 UI updates instantly!                    UI updates instantly!
```

---

## 🔄 **Message Sending Flow (Detailed)**

```
USER TYPES "Hello" AND CLICKS SEND
         │
         ├─────────────────────────────────────────────────────────┐
         │                    FRONTEND                             │
         │                                                          │
         ↓                                                          │
    MessageInput.jsx                                                │
         │                                                          │
         │ handleSendMessage(e)                                    │
         │   - e.preventDefault()                                  │
         │   - Validate text not empty                             │
         │   - Call store function ─────────────┐                  │
         │                                       │                  │
         │                                       ↓                  │
         │                           useChatStore.sendMessage()    │
         │                                       │                  │
         │                                       │ Build request:  │
         │                                       │ {               │
         │                                       │   text: "Hello",│
         │                                       │   image: null   │
         │                                       │ }               │
         │                                       │                  │
         │                                       ↓                  │
         │                           axiosInstance.post()          │
         │                           "/messages/send/:userId"      │
         │                           Headers: { jwt token }        │
         │                                       │                  │
         └───────────────────────────────────────┼──────────────────┘
                                                 │
                                            HTTP POST
                                                 │
         ┌───────────────────────────────────────┼──────────────────┐
         │                    BACKEND                               │
         │                                       │                  │
         │                                       ↓                  │
         │                          message.route.js               │
         │                          POST "/send/:id"               │
         │                                       │                  │
         │                                       ↓                  │
         │                          protectRoute middleware        │
         │                          - Verify JWT token             │
         │                          - Set req.user = decoded user  │
         │                                       │                  │
         │                                       ↓                  │
         │                          message.controller.js          │
         │                          sendMessage(req, res)          │
         │                                       │                  │
         │                          Extract:                       │
         │                          - senderId = req.user._id      │
         │                          - receiverId = req.params.id   │
         │                          - text = req.body.text         │
         │                                       │                  │
         │                                       ↓                  │
         │                          messageQueue.add()             │
         │                          'process-direct-message'       │
         │                          {                              │
         │                            senderId,                    │
         │                            receiverId,                  │
         │                            text: "Hello"                │
         │                          }                              │
         │                                       │                  │
         │                                       ↓                  │
         │                          Return 202 Accepted            │
         │                          { jobId: "abc123" } ───────┐   │
         │                                                      │   │
         └──────────────────────────────────────────────────────┼───┘
                                                                │
                                            HTTP Response       │
                                                                │
         ┌──────────────────────────────────────────────────────┼───┐
         │                    FRONTEND                          │   │
         │                                                      ↓   │
         │                          console.log('Queued!')          │
         │                          (No UI update yet!)             │
         │                                                          │
         └──────────────────────────────────────────────────────────┘


[MEANWHILE IN WORKER PROCESS]

         ┌──────────────────────────────────────────────────────────┐
         │              WORKER PROCESS                              │
         │                                       │                  │
         │                          Bull Queue picks up job        │
         │                                       │                  │
         │                                       ↓                  │
         │                     messageWorker.processDirectMessage() │
         │                          (job)                           │
         │                                       │                  │
         │                          Step 1: Upload image           │
         │                          if (job.data.image) {           │
         │                            cloudinary.upload()           │
         │                          }                               │
         │                                       │                  │
         │                                       ↓                  │
         │                          Step 2: Save to database       │
         │                          const message = await           │
         │                          Message.create({                │
         │                            senderId: job.data.senderId,  │
         │                            receiverId: job.data.receiverId,│
         │                            text: "Hello"                 │
         │                          })                              │
         │                                       │                  │
         │                                       ↓                  │
         │                          Step 3: Populate user data     │
         │                          await message.populate(         │
         │                            'senderId receiverId'         │
         │                          )                               │
         │                                       │                  │
         │                                       ↓                  │
         │                          Step 4: Publish to Redis       │
         │                          publisher.publish(              │
         │                            'new_message',                │
         │                            JSON.stringify(message)       │
         │                          )                               │
         │                                       │                  │
         └───────────────────────────────────────┼──────────────────┘
                                                 │
                                    Redis Pub/Sub Channel
                                     'new_message'
                                                 │
         ┌───────────────────────────────────────┼──────────────────┐
         │           BACKEND (Main Server)       │                  │
         │                                       │                  │
         │                          PubSubManager listening...     │
         │                                       │                  │
         │                                       ↓                  │
         │                          subscriber.on('message',       │
         │                            (channel, data) => {          │
         │                              handleNewMessage(data)      │
         │                            }                             │
         │                          )                               │
         │                                       │                  │
         │                                       ↓                  │
         │                          handleNewMessage()             │
         │                          - Parse message data            │
         │                          - Get socket IDs for sender    │
         │                            and receiver                  │
         │                                       │                  │
         │                          const senderSocket =           │
         │                            getReceiverSocketId(senderId) │
         │                          const receiverSocket =         │
         │                            getReceiverSocketId(receiverId)│
         │                                       │                  │
         │                                       ↓                  │
         │                          Socket.IO Emit:                │
         │                          io.to(senderSocket)            │
         │                            .emit('newMessage', message) │
         │                          io.to(receiverSocket)          │
         │                            .emit('newMessage', message) │
         │                                       │                  │
         └───────────────────────────────────────┼──────────────────┘
                                                 │
                                    WebSocket Events
                                                 │
                    ┌────────────────────────────┴─────────────────┐
                    │                                              │
         ┌──────────┼──────────────┐                  ┌───────────┼────────┐
         │    SENDER'S BROWSER     │                  │  RECEIVER'S BROWSER│
         │          │              │                  │           │        │
         │          ↓              │                  │           ↓        │
         │  socket.on('newMessage')│                  │ socket.on('newMessage')
         │          │              │                  │           │        │
         │          ↓              │                  │           ↓        │
         │  useChatStore update:  │                  │ useChatStore update:
         │  set({                 │                  │ set({               │
         │    messages: [         │                  │   messages: [       │
         │      ...old,           │                  │     ...old,         │
         │      newMessage        │                  │     newMessage      │
         │    ]                   │                  │   ]                 │
         │  })                    │                  │ })                  │
         │          │              │                  │           │        │
         │          ↓              │                  │           ↓        │
         │  React Re-render       │                  │ React Re-render    │
         │          │              │                  │           │        │
         │          ↓              │                  │           ↓        │
         │  ChatContainer.jsx     │                  │ ChatContainer.jsx  │
         │  shows "Hello"!        │                  │ shows "Hello"!     │
         │          │              │                  │           │        │
         └──────────┼──────────────┘                  └───────────┼────────┘
                    │                                             │
                    ↓                                             ↓
              ✅ UI Updated!                                ✅ UI Updated!
```

**Total time: ~100-200ms** (feels instant!)

---

## 🔐 **Authentication Flow**

```
USER ENTERS EMAIL & PASSWORD
         │
         ↓
    LoginPage.jsx
         │
         │ handleSubmit()
         │
         ↓
    useAuthStore.login({ email, password })
         │
         │ POST /api/auth/login
         │
         ↓
    ┌─────────────────────────────────────┐
    │         BACKEND                     │
    │                                     │
    │  auth.route.js                      │
    │         │                           │
    │         ↓                           │
    │  auth.controller.login()            │
    │         │                           │
    │         ├─ Find user in MongoDB     │
    │         │                           │
    │         ├─ Compare password         │
    │         │  (bcrypt.compare)         │
    │         │                           │
    │         ├─ Generate JWT token       │
    │         │  jwt.sign({ userId })     │
    │         │                           │
    │         ├─ Set cookie               │
    │         │  res.cookie('jwt', token) │
    │         │                           │
    │         └─ Return user data         │
    │            res.json({ user })       │
    │                                     │
    └─────────────────────────────────────┘
         │
         ↓ (HTTP Response with cookie)
    ┌─────────────────────────────────────┐
    │         FRONTEND                    │
    │                                     │
    │  useAuthStore updates:              │
    │  - authUser = userData              │
    │  - Connect Socket.IO                │
    │                                     │
    │  socket = io(BACKEND_URL, {         │
    │    auth: { token: user._id }        │
    │  })                                 │
    │                                     │
    │  Navigate to HomePage               │
    │                                     │
    └─────────────────────────────────────┘
```

---

## 🔒 **Protected Route Flow**

```
USER MAKES API REQUEST
         │
         │ Headers: { Cookie: jwt=token123 }
         │
         ↓
    ┌─────────────────────────────────────┐
    │  protectRoute middleware            │
    │                                     │
    │  1. Extract token from cookie       │
    │     const token = req.cookies.jwt   │
    │                                     │
    │  2. Verify token                    │
    │     const decoded = jwt.verify()    │
    │                                     │
    │  3. Find user in database           │
    │     const user = await User.findById│
    │                                     │
    │  4. Attach to request               │
    │     req.user = user                 │
    │                                     │
    │  5. Continue to controller          │
    │     next()                          │
    │                                     │
    └─────────────────────────────────────┘
         │
         ↓
    Controller can access req.user._id
```

---

## 🌐 **Cluster Architecture**

```
┌────────────────────────────────────────────────────────────────┐
│                    CLUSTER (cluster.js)                        │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              MASTER PROCESS                          │     │
│  │                                                       │     │
│  │  - Creates HTTP server                               │     │
│  │  - Initializes Socket.IO                             │     │
│  │  - Listens on port 5000                              │     │
│  │  - Spawns worker processes                           │     │
│  │  - Subscribes to Redis pub/sub                       │     │
│  │  - Handles Socket.IO connections                     │     │
│  │                                                       │     │
│  └───────────────────────┬──────────────────────────────┘     │
│                          │                                     │
│              ┌───────────┼───────────┐                        │
│              │           │           │                         │
│        ┌─────▼────┐ ┌────▼────┐ ┌───▼─────┐                  │
│        │ Worker 1 │ │ Worker 2│ │ Worker 3│                  │
│        │          │ │         │ │         │                  │
│        │ Handle   │ │ Handle  │ │ Handle  │                  │
│        │ HTTP     │ │ HTTP    │ │ HTTP    │                  │
│        │ requests │ │ requests│ │ requests│                  │
│        │          │ │         │ │         │                  │
│        └──────────┘ └─────────┘ └─────────┘                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
         │              │           │
         │              │           │
         └──────────────┴───────────┘
                        │
                        ↓
         ┌──────────────────────────────┐
         │     BULL QUEUE (Redis)       │
         │                              │
         │  Jobs distributed across:    │
         │  - Message Worker Process    │
         │  - Image Worker Process      │
         │  - Email Worker Process      │
         │                              │
         └──────────────────────────────┘
```

---

## 📦 **Database Schema Relationships**

```
┌─────────────────────────────────────────────────────────────┐
│                       MongoDB Collections                   │
└─────────────────────────────────────────────────────────────┘

     ┌────────────────┐
     │     USERS      │
     ├────────────────┤
     │ _id            │◄────────────────┐
     │ email          │                 │
     │ password       │                 │
     │ username       │                 │
     │ profilePic     │                 │
     │ createdAt      │                 │
     └────────────────┘                 │
            │                           │
            │ Referenced by:            │
            │                           │
            ↓                           │
     ┌────────────────┐                 │
     │   MESSAGES     │                 │
     ├────────────────┤                 │
     │ _id            │                 │
     │ senderId       │─────────────────┘
     │ receiverId     │─────────────────┐
     │ text           │                 │
     │ image          │                 │
     │ createdAt      │                 │
     │ reactions: [   │                 │
     │   {            │                 │
     │     userId ────┼─────────────────┘
     │     reaction   │
     │   }            │
     │ ]              │
     │ replyTo        │───┐
     └────────────────┘   │ (self-reference)
                          └─────────┐
                                    │
                                    ↓
                          Another message._id

     ┌────────────────┐
     │    GROUPS      │
     ├────────────────┤
     │ _id            │
     │ name           │
     │ avatar         │
     │ members: [     │
     │   userId ──────┼────────┐
     │ ]              │        │
     │ admins: [      │        │
     │   userId ──────┼────────┤
     │ ]              │        │
     │ messages: [    │        │
     │   {            │        │
     │     messageId ─┼───┐    │
     │     senderId ──┼───┼────┤
     │     text       │   │    │
     │   }            │   │    │
     │ ]              │   │    │
     │ createdAt      │   │    │
     └────────────────┘   │    │
                          │    │
     ┌────────────────────┘    │
     │                         │
     ↓                         ↓
Referenced USERS._id      Reference to USERS._id
```

---

## 🎯 **File Upload Flow**

```
USER SELECTS IMAGE
         │
         ↓
    MessageInput.jsx
         │
         │ handleImageChange()
         │ - Read file with FileReader
         │ - Convert to base64
         │ - Show preview
         │
         ↓
    User clicks Send
         │
         ↓
    sendMessage({
      text: "Check this out!",
      image: "data:image/png;base64,..." (base64 string)
    })
         │
         │ HTTP POST
         │
         ↓
    ┌─────────────────────────────────────┐
    │         BACKEND                     │
    │                                     │
    │  Controller adds to queue:          │
    │  {                                  │
    │    text: "Check this out!",         │
    │    image: "data:image/png;..."      │
    │  }                                  │
    │                                     │
    └─────────────────────────────────────┘
         │
         ↓
    ┌─────────────────────────────────────┐
    │      WORKER PROCESS                 │
    │                                     │
    │  if (job.data.image) {              │
    │    // Upload to Cloudinary          │
    │    const result = await             │
    │      cloudinary.uploader.upload(    │
    │        job.data.image               │
    │      );                             │
    │                                     │
    │    imageUrl = result.secure_url;    │
    │    // "https://cloudinary.com/..."  │
    │  }                                  │
    │                                     │
    │  Save to MongoDB:                   │
    │  {                                  │
    │    text: "Check this out!",         │
    │    image: imageUrl                  │
    │  }                                  │
    │                                     │
    └─────────────────────────────────────┘
         │
         ↓ (Pub/Sub → Socket.IO)
    ┌─────────────────────────────────────┐
    │         FRONTEND                    │
    │                                     │
    │  ChatContainer.jsx renders:         │
    │                                     │
    │  {message.image && (                │
    │    <img src={message.image} />      │
    │  )}                                 │
    │                                     │
    │  Image loads from Cloudinary CDN    │
    │                                     │
    └─────────────────────────────────────┘
```

---

## 💡 **Key Takeaways**

1. **Two Communication Channels:**
   - HTTP for sending (one-way)
   - WebSocket for receiving (real-time)

2. **Queue System Benefits:**
   - Async processing
   - Retry logic
   - Server doesn't wait

3. **Pub/Sub for Scaling:**
   - Works in cluster mode
   - Multiple servers can communicate
   - Real-time updates across instances

4. **Security Layers:**
   - JWT in cookies (HTTP)
   - Auth middleware (verify)
   - Socket.IO auth (WebSocket)

---

## 🚀 **Next Steps**

Now that you've seen the visual architecture:

1. ✅ Compare these diagrams to the code
2. ✅ Draw your own version on paper
3. ✅ Add console.logs to trace the flows
4. ✅ Read `LEARNING_GUIDE.md` for detailed explanations

**Understanding these flows = Understanding 80% of the app!** 🎉
