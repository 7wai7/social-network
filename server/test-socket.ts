import { io } from "socket.io-client";
import * as fs from 'fs'
import * as path from 'path';

const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ1c2VyNUBnbWFpbC5jb20iLCJpYXQiOjE3NTI1NzA5NjUsImV4cCI6MTc1MjY1NzM2NX0.I9aryssHy3eK7AET9X0F92eJsfYS-IjPC477CPMXSZw`;

const socket = io({
    withCredentials: true
});

socket.on("connect", () => {
    console.log("✅ Connected to server with id:", socket.id);

    const filePath = path.join("C:", "Data", `avatar.png`);

    const fileBuffer = fs.readFileSync(filePath);
    console.log(fileBuffer);


    // тестове повідомлення
    // socket.emit("chat-message", { chat_id: 1, text: "тест", files: [
    //     {
    //         file: fileBuffer
    //     }
    // ] });

    // socket.emit("join-chat", {
    //     chatId: 1
    // });

});

socket.on("chat-message", (data) => {
    console.log("📩 Отримано повідомлення:", data);
});

socket.on("disconnect", () => {
    console.log("❌ Відключено від сервера");
});
