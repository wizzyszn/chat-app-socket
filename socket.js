const {Server} = require('socket.io');
const http = require('http');
require('dotenv').config();
const server = http.createServer();
let onlineUsers = []
const io = new Server(server,{
    cors : 'http://localhost:3000/chat',
    methods: ['GET', 'POST']
});
io.on("connection", (socket) =>{
    socket.on("addNewUsers", (user) =>{
        console.log("Adding new user:", user);
        if(user === null) return
        !onlineUsers.some(users => users.userId === user._id) && 
        onlineUsers.push({
            userId : user._id,
            socketId : socket.id
        })
        io.emit('getOnlineUsers', onlineUsers);
        console.log("online users :", onlineUsers);
    })
    socket.on("sendMessages", (payload) =>{
        if(payload.message === null) return
        console.log("payload:", payload);
        
        const isUserPresent = onlineUsers.find((user) =>{
           
           return  user.userId === payload.recipient
        }); console.log("is present?", isUserPresent )

        if(isUserPresent){
            io.to(isUserPresent.socketId).emit("getMessage", payload.message);
            io.to(isUserPresent.socketId).emit("getNotification", {
                senderId : payload.message.senderId,
                isRead : false
            });
        }
    });
    socket.on("isUserTyping", (res) =>{
            const isUserPresent = onlineUsers.find((user) =>{
                return  user.userId === res.recipientId
             }); 
             if(isUserPresent){
                 io.to(isUserPresent.socketId).emit("getTpyingStatus", res.state);
             }
        
    })
    socket.on('disconnectUser', (user) =>{
        onlineUsers = onlineUsers.filter((users) =>{
            return users.socketId !== user._id  
        });
        io.emit('getOnlineUsers', onlineUsers);
        console.log('A user disconnected', onlineUsers)
    })
    
    socket.on('disconnect', () =>{
        onlineUsers = onlineUsers.filter((users) =>{
            return users.socketId !== socket.id
        })
        io.emit('getOnlineUsers', onlineUsers);

    })
})

io.listen(process.env.SOCKET_PORT || 4000)