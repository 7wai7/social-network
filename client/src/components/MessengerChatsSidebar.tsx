import type { JSX } from "react";
import "./RightSidebar.css"
import React, { useState } from "react";
import { fetchFindUsersByLogin, fetchUserChats } from "../services/api";
import type { Chat } from "../types/chat";
import { getSocket } from "../services/socket";
import type { ChatUser } from "../types/chatUser";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const MessengerChatsSidebar = (
    props: {
        setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>,
        handleContextMenu: (e: { preventDefault: () => void; pageX: any; pageY: any; }, callback: (setMenuButtons: React.Dispatch<React.SetStateAction<JSX.Element>>) => void) => void,
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
        console.log("select chat", chat);
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

        fetchFindUsersByLogin(value)
            .then(data => {
                setSearchResults(data);
            })
    }

    const renderUserChatItem = (user: ChatUser): JSX.Element => {
        const callback = (setMenuButtons: React.Dispatch<React.SetStateAction<JSX.Element>>) => {
            setMenuButtons(<>
                <Link to={`/profile/${user.login}`}>
                    <span>Profile</span>
                </Link>
            </>)
        }

        return (
            <button
                className="chat-item user"
                key={`user-${user.user_id}`}
                onClick={() => onChatClick({
                    id: user.chat_id,
                    isGroup: false,
                    other_user_id: user.user_id,
                    other_user_login: user.login
                })}
                onContextMenu={(e) => props.handleContextMenu(e, callback)}
            >
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
    }

    const renderChatItem = (chat: Chat): JSX.Element => {
        const callback = (setMenuButtons: React.Dispatch<React.SetStateAction<JSX.Element>>) => {
            setMenuButtons(<>
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
            </>)
        }


        return (
            <button
                className="chat-item chat"
                key={`chat-${chat.id}`}
                onClick={() => onChatClick(chat)}
                onContextMenu={(e) => props.handleContextMenu(e, callback)}
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
                    <div className="scroll-area">
                        <div className="chat-list">
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