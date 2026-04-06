import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

let socket = null;

export const getSocket = () => {
    if (socket) return socket;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.token) return null;

    socket = io(SOCKET_URL, {
        auth: { token: user.token },
        autoConnect: true,
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
