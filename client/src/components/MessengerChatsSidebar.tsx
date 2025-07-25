import type { JSX } from "react";
import "./RightSidebar.css"
import React, { useEffect, useRef, useState } from "react";
import { fetchFindUsersByLogin, fetchUserChats } from "../services/api";
import type { Chat } from "../types/chat";
import { connectSocket } from "../services/socket";
import type { ChatUser } from "../types/chatUser";
import { useQuery } from "@tanstack/react-query";

const MessengerChatsSidebar = (
    {
        setSelectedChat
    }: { setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>; }
): JSX.Element => {
    const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);
    const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
    const [search, setSearch] = useState('');

    const { data: chats = [], isLoading } = useQuery({
        queryKey: ['user-chats'],
        queryFn: () => {
            return fetchUserChats()
        }
    });

    useEffect(() => {
        const socket = connectSocket();
        socketRef.current = socket;
    }, []);

    const onChatClick = (chat: Chat) => {
        console.log("select chat", chat);
        socketRef.current?.emit('join-chat', chat.id);
        setSelectedChat(chat);
        setSearchResults([]);
        setSearch('');
    };


    const searchInput = (value: string) => {
        setSearch(value);

        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        fetchFindUsersByLogin(value)
            .then(data => {
                setSearchResults(data);
            })
    }

    return (
        <>
            <div className="right-sidebar messenger">
                <div className="search-block">
                    <input type="text" placeholder="Search..." className="search-input" value={search} onChange={e => searchInput(e.target.value)} />
                </div>

                {isLoading ? (
                    <div className='loading'>
                        <div className='loader'></div>
                        <span>Loading...</span>
                    </div>
                ) : (
                    <div className="scroll-area">
                        <div className="chat-list">
                            {
                                search.trim()
                                    ? searchResults.length === 0
                                        ? <div className="no-chats-title">
                                            <span>No users found</span>
                                        </div>
                                        : searchResults.map(user =>
                                            <button className="chat-item user" key={`user-${user.user_id}`}
                                                onClick={() => onChatClick({
                                                    id: user.chat_id,
                                                    isGroup: false,
                                                    other_user_id: user.user_id,
                                                    other_user_login: user.login
                                                })}>
                                                <img
                                                    src={`http://localhost:3000/avatars/${user.login}`}
                                                    alt={`${user.login}`}
                                                    className='chat-item avatar'
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null; // запобігає нескінченному циклу, якщо fallback теж не знайдеться
                                                        e.currentTarget.src = "/default_profile.png"; // шлях до картинки "Фото не знайдено"
                                                    }}
                                                />
                                                <span>{user.login} {user.user_id}</span>
                                            </button>
                                        )
                                    : chats.length === 0
                                        ? <div className="no-chats-title">
                                            <span>No chats</span>
                                        </div>
                                        : chats.map(chat =>
                                            <button className="chat-item chat" key={`chat-${chat.id}`}
                                                onClick={() => onChatClick(chat)}>
                                                💬 {chat.title || chat.other_user_login} {chat.other_user_id}
                                            </button>
                                        )
                            }
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default React.memo(MessengerChatsSidebar);