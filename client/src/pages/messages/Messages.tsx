import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { connectSocket } from '../../services/socket';
import { useOutletContext } from 'react-router-dom';
import type { Chat } from '../../types/chat';
import type { Message } from '../../types/message';
import { fetchFiles, fetchMessages } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import MessagesUI from '../../ui/MessagesUI';
import EventEmitter from '../../services/EventEmitter';
import type { AttachedFile } from '../../types/attachedFile';
import type { File } from '../../types/file';

type ContextType = {
    layoutEmitter: EventEmitter,
    selectedChat: Chat | null;
};

export default function Messages(): JSX.Element {
    const context = useOutletContext<ContextType>();
    const messagesEmitterRef = useRef(new EventEmitter());

    const [textareaText, setTextareaText] = useState('');
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [editedMessage, setEditedMessage] = useState<Message | null>(null);
    const [editedMessageSelectedFilesToDelete, setEditedMessageSelectedFilesToDelete] = useState<File[]>([]);
    const [queryVersion, setQueryVersion] = useState(Date.now());


    const socketRef = useRef(connectSocket());
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesWrapperRef = useRef<HTMLDivElement>(null);
    const attachedFilesRef = useRef<AttachedFile[]>([]);

    const [isReceivedMessage, setIsReceivedMessage] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

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
        const onChatMessage = (newMessage: Message) => {
            console.log("New message", newMessage);
            setAllMessages(prev => [newMessage, ...prev]);
            setIsReceivedMessage(true);
        };

        const onDeleteMessage = (deletedMessage: Message) => {
            if (deletedMessage.chat_id === context.selectedChat?.id) setAllMessages(prev => prev.filter(m => m.id !== deletedMessage.id));
        }

        const onUpdateMessage = (updatedMessage: Message) => {
            console.log('updated message', updatedMessage);

            setAllMessages(prev => prev.map(m => m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m))
        }

        const onChatMessageError = (err: any) => {
            console.log(err);
        }

        const onDeleteMessageError = (err: any) => {
            console.log(err)
        }


        const onGetAttachedFiles = (files: AttachedFile[]) => {
            attachedFilesRef.current = files;
        }

        socketRef.current.on('chat-message', onChatMessage);
        socketRef.current.on('delete-message', onDeleteMessage);
        socketRef.current.on('update-message', onUpdateMessage);
        socketRef.current.on('chat-message-error', onChatMessageError);
        socketRef.current.on('delete-message-error', onDeleteMessageError);
        messagesEmitterRef.current.on('get-attached-files', onGetAttachedFiles);

        return () => {
            socketRef.current.off('chat-message', onChatMessage);
            socketRef.current.off('delete-message', onDeleteMessage);
            socketRef.current.off('update-message', onUpdateMessage);
            socketRef.current.off('chat-message-error', onChatMessageError);
            socketRef.current.off('delete-message-error', onDeleteMessageError);
            messagesEmitterRef.current.on('get-attached-files', onGetAttachedFiles);
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
                setTextareaText(prev => prev + '\n');
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

    const onScroll = useCallback(() => {
        loadMessagesOnTop();
    }, [loadMessagesOnTop]);



    const sendMessage = () => {
        const textarea = textareaRef.current;
        const message = textareaRef.current?.value.trim();
        const chat = context.selectedChat;
        const socket = socketRef.current;

        if (!socket || !chat) {
            console.error("Need to select a chat.");
            return;
        }

        if (!message && attachedFilesRef.current.length === 0) {
            console.error("Message must contain either text or at least one file.");
            return;
        }

        if (!chat?.id && !chat?.other_user_id) return;

        console.log(`Send message to ${chat.title || chat.other_user_login}`)

        const sendMessageData = (files: File[] = []) => {
            const filesToDeleteIds = editedMessage
                ? editedMessageSelectedFilesToDelete.map(f => f.id)
                : [];


            const newMessage = {
                id: editedMessage?.id,
                chat_id: chat?.id,
                recipient_id: chat?.other_user_id,
                text: message,
                files,
                filesToDeleteIds
            }
            console.log('Message:', newMessage);

            if (editedMessage) {
                socket.emit("update-message", newMessage);
            } else
                socket.emit("chat-message", newMessage);


            if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }

            setTextareaText('');
            setEditedMessage(null);
            setEditedMessageSelectedFilesToDelete([]);
            messagesEmitterRef.current.emit('set-attached-files', []);
        }

        if (attachedFilesRef.current.length > 0 || editedMessageSelectedFilesToDelete.length > 0) {
            const formData = new FormData();
            attachedFilesRef.current.forEach(({ file, url }) => {
                formData.append('files', file);
                URL.revokeObjectURL(url)
            });

            const urls = editedMessageSelectedFilesToDelete.map(f => f.url);
            formData.append('filesToDeleteUrls', JSON.stringify(urls));


            fetchFiles(formData)
                .then(data => {
                    sendMessageData(data);
                })
                .catch((error) => console.error('Помилка при завантаженні файлів:', error));
        } else sendMessageData();
    };

    const deleteMessage = (id: number) => {
        socketRef.current.emit('delete-message', { id });
    }

    const editMessage = (m: Message) => {
        if (m.chat_id !== context.selectedChat?.id) return;

        setEditedMessage(m);
        setTextareaText(m.text);
        setEditedMessageSelectedFilesToDelete([]);
    }

    const cancelEditingMessage = () => {
        setEditedMessage(null);
        setTextareaText('');
        setEditedMessageSelectedFilesToDelete([]);
    }

    return <MessagesUI
        layoutEmitter={context.layoutEmitter}
        messagesEmitter={messagesEmitterRef.current}
        messagesWrapperRef={messagesWrapperRef}
        textareaRef={textareaRef}
        textareaText={textareaText}
        setTextareaText={setTextareaText}
        selectedChat={context.selectedChat}
        allMessages={allMessages}
        editedMessage={editedMessage}
        editedMessageSelectedFilesToDelete={editedMessageSelectedFilesToDelete}
        setEditedMessageSelectedFilesToDelete={setEditedMessageSelectedFilesToDelete}
        cancelEditingMessage={cancelEditingMessage}
        onScroll={onScroll}
        sendMessage={sendMessage}
        deleteMessage={deleteMessage}
        editMessage={editMessage}
    />
}