import { useEffect, useRef, useState, type JSX } from 'react';
import './Messages.css'
import connectSocket from '../../services/socket';
import { useOutletContext } from 'react-router-dom';
import type { Chat } from '../../types/chat';
import type { Message } from '../../types/message';
import { timeAgo } from '../../globals';
import { ContextMenu } from '../../components/ContextMenu';
import { fetchMessages } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useUser } from '../../contexts/UserContext';

type ContextType = {
    selectedChat: Chat | null;
};

export default function Messages(): JSX.Element {
    const { user } = useUser();
    const context = useOutletContext<ContextType>();
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [queryVersion, setQueryVersion] = useState(Date.now());


    const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesWrapperRef = useRef<HTMLDivElement>(null);
    const [isReceivedMessage, setIsReceivedMessage] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [menuButtons, setMenuButtons] = useState<JSX.Element>(<></>);

    const { data } = useQuery({
        queryKey: ['chat-messages', queryVersion],
        queryFn: () => {
            const lastMessage = allMessages.at(-1);
            return fetchMessages(context.selectedChat?.id, lastMessage?.createdAt)
        },
        enabled: !!context.selectedChat && hasMoreMessages,
    });



    useEffect(() => {
        if (data?.length && data.length > 0) {
            setAllMessages(prev => [...prev, ...data]);
        }

        if (Array.isArray(data) && data.length === 0) {
            setHasMoreMessages(false);
        }
    }, [data]);

    useEffect(() => {
        console.log("context.selectedChat", context.selectedChat);

        setQueryVersion(Date.now());
        setAllMessages([]);
        setHasMoreMessages(true);
    }, [context.selectedChat]) // перехід на новий чат

    useEffect(() => {
        const socket = connectSocket();
        socketRef.current = socket;

        const onChatMessage = (newMessage: Message) => {
            console.log("New message", newMessage);
            setAllMessages(prev => [newMessage, ...prev]);
            setIsReceivedMessage(true);
        };

        // const onLoadMessages = (data: Message[]) => {
        //     console.log("New message", data);
        //     setAllMessages(data);
        //     scrollToDown();
        // };

        const onChatMessageError = (err: any) => {
            console.log(err);
        }

        socket.on('chat-message', onChatMessage);
        // socket.on('load-messages', onLoadMessages);
        socket.on('chat-message-error', onChatMessageError);

        return () => {
            socket.off('chat-message', onChatMessage);
            // socket.off('load-messages', onLoadMessages);
            socket.off('chat-message-error', onChatMessageError);
        };
    }, []);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const handleInput = (e: KeyboardEvent) => {
            if ((e.code === 'Enter' || e.keyCode === 13) && !e.ctrlKey) {
                e.preventDefault();
                sendMessage();
            } else if ((e.code === 'Enter' || e.keyCode === 13) && e.ctrlKey) {
                // перейти на нову строку
                textarea.value += '\n'
            }
        };

        textarea.addEventListener("keydown", handleInput);
        return () => textarea.removeEventListener("keydown", handleInput);
    }, []);

    useEffect(() => {
        if (allMessages.length < 50) scrollToDown();
    }, [allMessages]);

    useEffect(() => {
        if (isReceivedMessage) {
            setIsReceivedMessage(false);
            scrollToDown('smooth');
        }
    }, [allMessages]);

    const scrollToDown = (behavior: ScrollBehavior = 'instant') => {
        console.log(behavior);

        const wrapper = messagesWrapperRef.current;
        wrapper?.scrollTo({ top: wrapper.scrollHeight, behavior });
    }



    // useEffect(() => {
    //     const handleClickOutside = (e: MouseEvent) => {
    //         if (e.ctrlKey) {
    //             // console.log(context.messagesByDate);

    //             // loadMessagesOnTop()

    //             console.log('f');
    //             console.log(data);
    //             console.log(hasNextPage);
    //             fetchNextPage()
    //         }
    //     };
    //     document.addEventListener('click', handleClickOutside);
    //     return () => document.removeEventListener('click', handleClickOutside);
    // }, [data, hasNextPage, context.selectedChat, context.messagesByDate]);


    const loadMessagesOnTop = () => {
        const chat = context.selectedChat;
        if (!chat || !chat.id) return;
        const wrapper = messagesWrapperRef.current;
        if (!wrapper) return;
        if (wrapper.scrollTop > 200) return;

        setQueryVersion(Date.now());

        // const lastMessage = allMessages.at(-1);
        // if (lastMessage) {
        //     setCursor(lastMessage.createdAt);
        // }
    }

    const handleContextMenu = (e: { preventDefault: () => void; pageX: any; pageY: any; }, message: Message) => {
        e.preventDefault();
        setMenuPosition({ x: e.pageX, y: e.pageY });
        setMenuVisible(true);

        const isOwnMessage = message.user.id === user?.id;

        setMenuButtons(<>
            {
                isOwnMessage && (
                    <button>
                        <span>Edit</span>
                    </button>
                )
            }
            <button>
                <span>Copy text</span>
            </button>
            {
                isOwnMessage && (
                    <button>
                        <span>Delete</span>
                    </button>
                )
            }
        </>)

    };


    const sendMessage = () => {
        const textarea = textareaRef.current;
        const message = textareaRef.current?.value.trim();
        const chat = context.selectedChat;
        const socket = socketRef.current;

        if (!message || !socket || !chat) {
            console.error("Need to select a chat and write a message.");
            return;
        }

        const newMessage = {
            chat_id: chat?.id,
            recipient_id: chat?.other_user_id,
            text: message
        }

        console.log(`Send message to ${chat.title || chat.other_user_login}`)
        console.log('Message:', newMessage);

        console.log("from", user);


        socket.emit("chat-message", newMessage);

        if (textarea) {
            textarea.value = '';
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };


    const renderMessagesByDate = (messages: Message[] | unknown): JSX.Element => {
        if (!Array.isArray(messages)) return <></>

        const groupDays: Record<string, Message[]> = {};

        for (const m of messages) {
            const key = new Date(m.createdAt).toISOString().split("T")[0];

            groupDays[key] ??= []
            groupDays[key].push(m);
        }

        const keys = Object.keys(groupDays).sort();

        return (
            <>
                {keys.map((date) => (
                    <MessageDayBlock key={date} date={date} messages={groupDays[date]} />
                ))}
            </>
        );
    };

    const MessageDayBlock = React.memo(({ date, messages }: { date: string, messages: Message[] }) => {
        return (
            <div className="message-day-block">
                <div className="day-label">{new Date(date).toLocaleDateString()}</div>
                {messages.slice().reverse().map(m => renderMessage(m))}
            </div>
        );
    });

    const renderMessage = (m: Message): JSX.Element => {
        const isOwnMessage = m.user.id === user?.id;

        return (
            <div className={`message ${isOwnMessage ? 'own-message' : ''}`} key={m.id} onContextMenu={(e) => handleContextMenu(e, m)}>
                {!isOwnMessage ? <h5 className="sender">{m.user.login}</h5> : ''}
                <div className="message-content">{m.text}</div>
                <div className="time-ago">{timeAgo(m.createdAt)}</div>
            </div>
        )
    }

    return (
        <>
            <div className='chat-window'>
                {
                    context.selectedChat
                        ? <>
                            <h2 className='chat-title'>{context.selectedChat.title || context.selectedChat.other_user_login}</h2>
                            <div className="messages-wrapper" ref={messagesWrapperRef} onScroll={() => loadMessagesOnTop()}>
                                <div className="messages-container">
                                    {renderMessagesByDate(allMessages)}
                                </div>
                            </div>
                            <div className="message-textarea-wrapper">
                                <div className='scroll-block'>
                                    <textarea name="message" className="message-textarea textarea-autosize" placeholder="Повідомлення" ref={textareaRef}></textarea>
                                </div>
                                <button className="send-messages-btn" onClick={() => sendMessage()}>
                                    <svg fill="#fff" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16,464,496,256,16,48V208l320,48L16,304Z" />
                                    </svg>
                                </button>
                            </div>
                        </>
                        : <div className='select-chat-title'>
                            <span>Select a chat</span>
                        </div>
                }

                {menuVisible && (
                    <ContextMenu
                        x={menuPosition.x}
                        y={menuPosition.y}
                        visible={menuVisible}
                        buttons={menuButtons}
                    />
                )}
            </div>
        </>
    )
}