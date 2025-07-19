import type { JSX } from "react";
import "./RightSidebar.css"
import { useLocation } from "react-router-dom";
import React from "react";

const RightSidebar = (): JSX.Element => {
    const location = useLocation();

    if (location.pathname.startsWith('/messages')) {
        return (
            <>
                <div className="right-sidebar messages">
                    <div className="chat-list">

                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <div className="right-sidebar">

            </div>
        </>
    )
}

export default React.memo(RightSidebar);