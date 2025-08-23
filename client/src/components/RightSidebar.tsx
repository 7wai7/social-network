import type { JSX } from "react";
import "./RightSidebar.css"
import { useLocation } from "react-router-dom";
import React, { useState } from "react";
import type { Chat } from "../types/chat";
import MessengerChatsSidebar from "./MessengerChatsSidebar";
import type EventEmitter from "../services/EventEmitter";
import { fetchSearch } from "../services/api";
import Loader from "./Loader";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const RightSidebar = (
    props: {
        layoutEmitter: EventEmitter,
        setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>,
    }
): JSX.Element => {
    const location = useLocation();
    const [search, setSearch] = useState('');

    const {
        data,
        isLoading,
    } = useQuery({
        queryKey: ['search', search],
        queryFn: () => {
            return fetchSearch(search, 8);
        },
        enabled: !!search.trim()
    });

    if (location.pathname.startsWith('/messages')) {
        return <MessengerChatsSidebar
            layoutEmitter={props.layoutEmitter}
            setSelectedChat={props.setSelectedChat}
        />
    }

    return (
        <div className="right-sidebar">
            <div className="search-block">
                <input type="text" placeholder="Search..." className="search-input" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {search.trim() && (
                <div className="search-scroll-area">
                    {
                        isLoading || !data
                            ? <Loader />
                            : <>
                                <div className="search-list">
                                    {data.map(user =>
                                        <Link to={`/profile/${user.login}`} key={user.id} className="search-item">
                                            <img
                                                src={`http://localhost:3000/avatars/${user.login}`}
                                                alt={`${user.login}`}
                                                className='avatar'
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null; // запобігає нескінченному циклу, якщо fallback теж не знайдеться
                                                    e.currentTarget.src = "/default_profile.png"; // шлях до картинки "Фото не знайдено"
                                                }}
                                            />
                                            <span>{user.login}</span>
                                        </Link>
                                    )}
                                </div>
                            </>
                    }
                </div>
            )}
        </div>
    )
}

export default RightSidebar;