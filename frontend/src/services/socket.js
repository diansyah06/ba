import { io } from "socket.io-client";

// MENGGUNAKAN URL VERCEL UNTUK SOCKET
const SOCKET_URL = "https://back-end-asah.vercel.app";

let socket;

export const initSocket = (userId) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket'], // Wajib untuk kestabilan koneksi cross-origin
            reconnection: true,
            secure: true, // Penting karena Vercel menggunakan HTTPS
        });
        console.log("Menginisialisasi Socket ke Vercel...");
    }

    if (socket && userId) {
        socket.emit("register_user", userId);
    }

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};