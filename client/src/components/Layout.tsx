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
import EventEmitter from '../services/EventEmitter.ts';

export default function Layout(): JSX.Element {
    const layoutEmitterRef = useRef(new EventEmitter());
    const socketRef = useRef(connectSocket());

    const { user } = useUser();
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [lastChatMessage, setLastChatMessage] = useState<Message | null>(null);

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [menuButtons, setMenuButtons] = useState<JSX.Element>(<></>);
    const lastContextTargetRef = useRef<EventTarget | null>(null);

    useEffect(() => {
        const connect = () => {
            console.log("✅ Connected to server with id:", socketRef.current.id);
        }

        const disconnect = () => {
            console.log("Відключено від сервера");
        }

        const onChatMessage = (newMessage: Message) => {
            /* if(user && user.id !== newMessage.user.id) */ setLastChatMessage(newMessage);
        };

        socketRef.current.on("connect", connect);
        socketRef.current.on("disconnect", disconnect);
        socketRef.current.on('chat-message', onChatMessage);

        return () => {
            socketRef.current.off('load-messages', connect);
            socketRef.current.off('chat-message', disconnect);
            socketRef.current.off('chat-message', onChatMessage);
        };
    }, [])

    useEffect(() => {
        const onDeleteMessage = (deletedMessage: Message) => {
            if (deletedMessage.id === lastChatMessage?.id) setLastChatMessage(null);
        }

        socketRef.current.on('delete-message', onDeleteMessage);

        return () => {
            socketRef.current.off('delete-message', onDeleteMessage);
        };
    }, [lastChatMessage])

    useEffect(() => {
        const onHandleContextMenu = (e: React.MouseEvent, buttons: JSX.Element) => {
            if (e.target === lastContextTargetRef.current) {
                // другий клік на тому самому — стандартне меню
                lastContextTargetRef.current = null;
                return;
            }

            e.preventDefault();
            setMenuPosition({ x: e.pageX, y: e.pageY });
            setMenuVisible(true);
            setMenuButtons(buttons);
            lastContextTargetRef.current = e.target;
        }

        layoutEmitterRef.current.on("handle-context-menu", onHandleContextMenu);

        return () => {
            layoutEmitterRef.current.off('handle-context-menu', onHandleContextMenu);
        };
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            const target = event.target as HTMLElement;
            if (target.matches && !target.matches('.context-menu')) {
                setMenuVisible(false);
                lastContextTargetRef.current = null;
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // useEffect(() => {
    //     const handleClickOutside = () => {
    //         console.log(messagesList);
    //     };
    //     document.addEventListener('click', handleClickOutside);
    //     return () => document.removeEventListener('click', handleClickOutside);
    // }, [messagesList]);

    return (
        <>
            <PostModal layoutEmitter={layoutEmitterRef.current} />
            <LeftNavBar />
            <main>
                <Outlet
                    context={{
                        layoutEmitter: layoutEmitterRef.current,
                        selectedChat,
                        setSelectedChat,
                        lastChatMessage,
                    }}
                />
            </main>
            <Footer
                layoutEmitter={layoutEmitterRef.current}
                lastChatMessage={lastChatMessage}
                setSelectedChat={setSelectedChat}
            />
            <RightSidebar
                layoutEmitter={layoutEmitterRef.current}
                setSelectedChat={setSelectedChat}
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