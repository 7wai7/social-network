import type { JSX } from "react";
import "./Footer.css"
import { Link } from "react-router-dom";
import type { Message } from "../types/message";
import type { Chat } from "../types/chat";
import type EventEmitter from "../services/EventEmitter";

export interface PostModalFun {
    open: () => void;
    close: () => void;
}

export default function Footer(
    props: {
        layoutEmitter: EventEmitter,
        lastChatMessage: Message | null,
        setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>
    }
): JSX.Element {
    const setSelectedChatByMessage = (m: Message | null) => {
        if (!m) return;

        props.setSelectedChat({
            id: m.chat?.id,
            isGroup: m.chat?.isGroup,
            title: m.chat?.title,
            other_user_id: m.user.id,
            other_user_login: m.user.login
        })
    }

    return (
        <footer>
            <div className="footer-content">
                <button className='post-btn' onClick={() => props.layoutEmitter.emit('open-post-modal')}>
                    <span>Post</span>
                </button>
                <div className="last-chat-message-block">
                    <Link to={"/messages"} className="chats-btn">
                        <svg
                            fill="#fff"
                            viewBox="0 0 256.00098 256.00098"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M80.00049,144.00048v40a8,8,0,0,0,8,8h96.41709l39.58291,32v-128a8,8,0,0,0-8-8h-40v48a8,8,0,0,1-8,8Z"
                                opacity="0.2">
                            </path>
                            <path d="M232,96.00049a16.01833,16.01833,0,0,0-16-16H184.001v-32a16.01833,16.01833,0,0,0-16-16h-128a16.01833,16.01833,0,0,0-16,16v128a7.99978,7.99978,0,0,0,13.02929,6.22119L72,153.95038l.001,30.05011a16.01833,16.01833,0,0,0,16,16h93.58789l37.38281,30.22119a7.99979,7.99979,0,0,0,13.0293-6.22119ZM66.55371,137.7793,40.001,159.24561V48.00049h128V87.98114l-.001.01935.001.01935v47.98065H71.583A7.9992,7.9992,0,0,0,66.55371,137.7793Zm122.89356,48a7.99922,7.99922,0,0,0-5.0293-1.77881H88.001l-.001-32h80.001a16.01834,16.01834,0,0,0,16-16v-40H216l.001,111.24512Z">
                            </path>
                        </svg>
                    </Link>
                    {
                        props.lastChatMessage
                            ? <>
                                <button className="chat-title" onClick={() => setSelectedChatByMessage(props.lastChatMessage)}>{props.lastChatMessage.chat?.isGroup ? props.lastChatMessage.chat.title : props.lastChatMessage.user.login}</button>
                                <div className="last-message" onClick={() => setSelectedChatByMessage(props.lastChatMessage)}>{props.lastChatMessage.text}</div>
                            </>
                            : <>
                                <div className="last-message">No new messages</div>
                            </>
                    }
                </div>
            </div>
        </footer>
    )
}