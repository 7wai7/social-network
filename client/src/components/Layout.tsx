import { Outlet } from 'react-router-dom';
import LeftNavBar from './LeftNavBar.tsx';
import PostModal, { type PostModalFun } from './PostModal.tsx';
import { useEffect, useRef, useState, type JSX } from 'react';
import RightSidebar from './RightSidebar.tsx';
import connectSocket from '../services/socket.ts';
import type { Chat } from '../types/chat.ts';

export default function Layout(): JSX.Element {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

    const postModalFun = useRef<PostModalFun>({
        open: () => { },
        close: () => { },
    });

    useEffect(() => {
        const socket = connectSocket();

        const connect = () => {
            console.log("✅ Connected to server with id:", socket.id);
        }

        const disconnect = () => {
            console.log("Відключено від сервера");
        }

        socket.on("connect", connect);
        socket.on("disconnect", disconnect);

        return () => {
            socket.off('load-messages', connect);
            socket.off('chat-message', disconnect);
        };
    }, [])

    // useEffect(() => {
    //     const handleClickOutside = () => {
    //         console.log(messagesList);
    //     };
    //     document.addEventListener('click', handleClickOutside);
    //     return () => document.removeEventListener('click', handleClickOutside);
    // }, [messagesList]);

    return (
        <>
            <PostModal postModalFun={postModalFun} />
            <LeftNavBar postModalFun={postModalFun} />
            <main>
                <Outlet
                    context={{
                        selectedChat,
                        setSelectedChat,
                    }}
                />
            </main>
            <RightSidebar
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
            />
        </>
    );
}