import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export default function connectSocket(): Socket {
    if (!socket) {
        socket = io("http://localhost:3000", {
            withCredentials: true
        });

        return socket;
    }

    return socket;
}