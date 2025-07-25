import type { JSX } from "react";
import "./RightSidebar.css"
import { useLocation } from "react-router-dom";
import React from "react";
import type { Chat } from "../types/chat";
import MessengerChatsSidebar from "./MessengerChatsSidebar";

const RightSidebar = (
    {
        setSelectedChat
    }: { setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>; }
): JSX.Element => {
    const location = useLocation();

    if (location.pathname.startsWith('/messages')) {
        return <MessengerChatsSidebar setSelectedChat={setSelectedChat}/>
    }

    return (
        <>
            <div className="right-sidebar">

            </div>
        </>
    )
}

export default RightSidebar;