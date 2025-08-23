import type { JSX } from "react";
import "./RightSidebar.css"
import React, { useState } from "react";
import { fetchFindChatUsersByLogin, fetchUserChats } from "../services/api";
import type { Chat } from "../types/chat";
import { getSocket } from "../services/socket";
import type { ChatUser } from "../types/chatUser";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type EventEmitter from "../services/EventEmitter";

const MessengerChatsSidebar = (
    props: {
        layoutEmitter: EventEmitter,
        setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>,
    }
): JSX.Element => {
    const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
    const [search, setSearch] = useState('');

    const { data: chats = [], isLoading } = useQuery({
        queryKey: ['user-chats'],
        queryFn: () => {
            return fetchUserChats()
        }
    });

    const onChatClick = (chat: Chat) => {
        // console.log("select chat", chat);
        getSocket()?.emit('join-chat', chat.id);
        props.setSelectedChat(chat);
        setSearchResults([]);
        setSearch('');
    };


    const searchInput = (value: string) => {
        setSearch(value);

        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        fetchFindChatUsersByLogin(value)
            .then(data => {
                setSearchResults(data);
            })
    }

    const renderUserChatItem = (user: ChatUser): JSX.Element => {
        const buttons: JSX.Element =
            <>
                <Link to={`/profile/${user.login}`}>
                    <span>Profile</span>
                </Link>
            </>


        return (
            <button
                className="search-item user"
                key={`user-${user.user_id}`}
                onClick={() => onChatClick({
                    id: user.chat_id,
                    isGroup: false,
                    other_user_id: user.user_id,
                    other_user_login: user.login
                })}
                onContextMenu={(e) => props.layoutEmitter.emit('handle-context-menu', e, buttons)}
            >
                <img
                    src={`http://localhost:3000/avatars/${user.login}`}
                    alt={`${user.login}`}
                    className='search-item avatar'
                    onError={(e) => {
                        e.currentTarget.onerror = null; // запобігає нескінченному циклу, якщо fallback теж не знайдеться
                        e.currentTarget.src = "/default_profile.png"; // шлях до картинки "Фото не знайдено"
                    }}
                />
                <span>{user.login}</span>
            </button>
        )
    }

    const renderChatItem = (chat: Chat): JSX.Element => {
        const buttons: JSX.Element =
            <>
                {
                    chat.other_user_login
                        ? (
                            <Link to={`/profile/${chat.other_user_login}`}>
                                <span>Profile</span>
                            </Link>
                        )
                        : (
                            <button>
                                <span>Copy text</span>
                            </button>
                        )
                }
            </>


        return (
            <button
                className="search-item chat"
                key={`chat-${chat.id}`}
                onClick={() => onChatClick(chat)}
                onContextMenu={(e) => props.layoutEmitter.emit('handle-context-menu', e, buttons)}
            >
                💬 {chat.title || chat.other_user_login} {chat.other_user_id}
            </button>
        )
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
                    <div className="search-scroll-area">
                        <div className="search-list">
                            {
                                search.trim()
                                    ? searchResults.length === 0
                                        ? <div className="no-chats-title">
                                            <span>No users found</span>
                                        </div>
                                        : searchResults.map(user => renderUserChatItem(user))
                                    : chats.length === 0
                                        ? <div className="no-chats-title">
                                            <span>No chats</span>
                                        </div>
                                        : chats.map(chat => renderChatItem(chat))
                            }
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default MessengerChatsSidebar;