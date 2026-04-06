const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const TherapistChatRoom = require('../models/TherapistChatRoom');

const setupSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
        },
    });

    // JWT authentication middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication error: No token'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.userId}`);

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.userId} joined room ${roomId}`);
        });

        socket.on('leaveRoom', (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.userId} left room ${roomId}`);
        });

        socket.on('message', async ({ room, text }) => {
            if (!text || !text.trim() || !room) return;

            try {
                const message = {
                    senderId: socket.userId,
                    text: text.trim(),
                    timestamp: new Date(),
                };

                // Save to database
                await TherapistChatRoom.findByIdAndUpdate(room, {
                    $push: { messages: message },
                });

                // Broadcast to everyone in the room (including sender)
                io.to(room).emit('message', message);
            } catch (err) {
                console.error('Socket message error:', err.message);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.userId}`);
        });
    });

    return io;
};

module.exports = setupSocket;
