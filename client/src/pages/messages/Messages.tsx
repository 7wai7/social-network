import { useEffect, useRef, useState, type JSX } from 'react';
import { connectSocket } from '../../services/socket';
import { useOutletContext } from 'react-router-dom';
import type { Chat } from '../../types/chat';
import type { Message } from '../../types/message';
import { fetchMessages } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useUser } from '../../contexts/UserContext';
import MessagesUI from '../../ui/MessagesUI';

type ContextType = {
    selectedChat: Chat | null;
    handleContextMenu: (e: { preventDefault: () => void; pageX: any; pageY: any; }, callback: (setMenuButtons: React.Dispatch<React.SetStateAction<JSX.Element>>) => void) => void;
};

type AttachedFile = {
    file: File;
    id: string;
};

export default function Messages(): JSX.Element {
    const { user } = useUser();
    const context = useOutletContext<ContextType>();
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [queryVersion, setQueryVersion] = useState(Date.now());


    const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesWrapperRef = useRef<HTMLDivElement>(null);
    const attachFileInputRef = useRef<HTMLInputElement>(null);
    const [isReceivedMessage, setIsReceivedMessage] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

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

        const onChatMessageError = (err: any) => {
            console.log(err);
        }

        socket.on('chat-message', onChatMessage);
        socket.on('chat-message-error', onChatMessageError);

        return () => {
            socket.off('chat-message', onChatMessage);
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

    const loadMessagesOnTop = () => {
        const chat = context.selectedChat;
        if (!chat || !chat.id) return;
        const wrapper = messagesWrapperRef.current;
        if (!wrapper) return;
        if (wrapper.scrollTop > 200) return;

        setQueryVersion(Date.now());
    }


    const sendMessage = () => {
        const textarea = textareaRef.current;
        const message = textareaRef.current?.value.trim();
        const chat = context.selectedChat;
        const socket = socketRef.current;

        if (!socket || !chat) {
            console.error("Need to select a chat.");
            return;
        }

        if (!message && attachedFiles.length === 0) {
            console.error("Message must contain either text or at least one file.");
            return;
        }

        if (!chat?.id && !chat?.other_user_id) return;

        const files: File[] = [];
        attachedFiles.map(({ file }) => files.push(file));

        const newMessage = {
            chat_id: chat?.id,
            recipient_id: chat?.other_user_id,
            text: message,
            files
        }


        // const formData = new FormData();

        // formData.append('chat_id', String(chat.id));
        // formData.append('recipient_id', String(chat?.other_user_id));
        // formData.append('message', message);
        // attachedFiles.forEach(({ file }) => {
        //     formData.append('files', file);
        // });

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

    const attachFileChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const filesArr = Array.from(event.target.files || []);
        console.log(filesArr);
        if (filesArr.length === 0) return;

        const newFiles = filesArr.map(file => ({
            file,
            id: crypto.randomUUID(),
        }));

        setAttachedFiles(prev => [...prev, ...newFiles]);
    }

    return <MessagesUI
        messagesWrapperRef={messagesWrapperRef}
        attachFileInputRef={attachFileInputRef}
        textareaRef={textareaRef}
        selectedChat={context.selectedChat}
        allMessages={allMessages}
        handleContextMenu={context.handleContextMenu}
        loadMessagesOnTop={loadMessagesOnTop}
        attachFileChangeHandler={attachFileChangeHandler}
        sendMessage={sendMessage}
    />
}