import type { JSX } from "react";
import "./RightSidebar.css"
import { useLocation } from "react-router-dom";
import React from "react";
import type { Chat } from "../types/chat";
import MessengerChatsSidebar from "./MessengerChatsSidebar";

const RightSidebar = (
    props: {
        setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>,
        handleContextMenu: (e: { preventDefault: () => void; pageX: any; pageY: any; }, callback: (setMenuButtons: React.Dispatch<React.SetStateAction<JSX.Element>>) => void) => void,
    }
): JSX.Element => {
    const location = useLocation();

    if (location.pathname.startsWith('/messages')) {
        return <MessengerChatsSidebar
            setSelectedChat={props.setSelectedChat}
            handleContextMenu={props.handleContextMenu}
        />
    }

    return (
        <div className="right-sidebar">

        </div>
    )
}

export default RightSidebar;