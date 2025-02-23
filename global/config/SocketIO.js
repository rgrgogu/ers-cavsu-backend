const { Server } = require("socket.io");
const http = require("http");

let io; // Define `io` globally so it can be accessed anywhere
const onlineUsers = new Map(); // Store userId -> socketId

const SocketIO = (app) => {
    const server = http.createServer(app);
    io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: [
                "http://localhost:5173",
                "https://cvsu-ers.netlify.app",
                "https://ers-cavsu-frontend.vercel.app",
                "https://drive.google.com"
            ],
            // origin: "*"
        },
    });

    // Handle socket connection
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Store userId when they join
        socket.on("registerUser", (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ID: ${socket.id}`);
            console.log(onlineUsers)
        });

        // Remove user when they disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
        });
    });

    return server;
};

// Export `io` so other files can use it
const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
};

const getOnlineUsers = () => onlineUsers; // Export online users

module.exports = { SocketIO, getIO, getOnlineUsers };
