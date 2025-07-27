import { Outlet } from 'react-router-dom';
import LeftNavBar from './LeftNavBar.tsx';
import PostModal from './PostModal.tsx';
import { useEffect, useRef, useState, type JSX } from 'react';
import RightSidebar from './RightSidebar.tsx';
import { connectSocket } from '../services/socket.ts';
import type { Chat } from '../types/chat.ts';
import Footer from './Footer.tsx';
import type { Message } from '../types/message.ts';
import { useUser } from '../contexts/UserContext.tsx';
import { ContextMenu } from './ContextMenu.tsx';

export default function Layout(): JSX.Element {
    const { user } = useUser();
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const postModalRef = useRef<HTMLDivElement>(null);
    const [lastChatMessage, setLastChatMessage] = useState<Message | null>(null);

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [menuButtons, setMenuButtons] = useState<JSX.Element>(<></>);

    const postModalFun = {
        open: () => {
            postModalRef.current?.removeAttribute('hidden');
        },
        close: () => {
            postModalRef.current?.setAttribute('hidden', '');
        },
    };

    useEffect(() => {
        const socket = connectSocket();
        console.log("socket", socket);


        const connect = () => {
            console.log("✅ Connected to server with id:", socket.id);
        }

        const disconnect = () => {
            console.log("Відключено від сервера");
        }

        const onChatMessage = (newMessage: Message) => {
            /* if(user && user.id !== newMessage.user.id) */ setLastChatMessage(newMessage);
        };

        socket.on("connect", connect);
        socket.on("disconnect", disconnect);
        socket.on('chat-message', onChatMessage);

        return () => {
            socket.off('load-messages', connect);
            socket.off('chat-message', disconnect);
            socket.off('chat-message', onChatMessage);
        };
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            const target = event.target as HTMLElement;
            if (target.matches && !target.matches('.context-menu')) {
                setMenuVisible(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleContextMenu = (e: { preventDefault: () => void; pageX: any; pageY: any; }, callback: (setMenuButtons: React.Dispatch<React.SetStateAction<JSX.Element>>) => void) => {
        e.preventDefault();
        setMenuPosition({ x: e.pageX, y: e.pageY });
        setMenuVisible(true);
        callback(setMenuButtons);
    };

    // useEffect(() => {
    //     const handleClickOutside = () => {
    //         console.log(messagesList);
    //     };
    //     document.addEventListener('click', handleClickOutside);
    //     return () => document.removeEventListener('click', handleClickOutside);
    // }, [messagesList]);

    return (
        <>
            <PostModal postModalRef={postModalRef} />
            <LeftNavBar />
            <main>
                <Outlet
                    context={{
                        selectedChat,
                        setSelectedChat,
                        lastChatMessage,
                        handleContextMenu
                    }}
                />
            </main>
            <Footer
                postModalFun={postModalFun}
                lastChatMessage={lastChatMessage}
                setSelectedChat={setSelectedChat}
            />
            <RightSidebar
                setSelectedChat={setSelectedChat}
                handleContextMenu={handleContextMenu}
            />

            {menuVisible && (
                <ContextMenu
                    x={menuPosition.x}
                    y={menuPosition.y}
                    visible={menuVisible}
                    buttons={menuButtons}
                />
            )}
        </>
    );
}