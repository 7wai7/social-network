import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(): Socket {
    if (!socket) {
        console.log("connect socket");
        
        socket = io("http://localhost:3000", {
            withCredentials: true
        });

        return socket;
    }

    socket.connect();
    return socket;
}

export function getSocket(): Socket | null {
    return socket;
}