import type { JSX } from "react";
import React from "react";
import type { Message } from "../types/message";
import { useUser } from "../contexts/UserContext";
import type { Chat } from "../types/chat";
import './Messages.css'

export default function Messages(
    props: {
        messagesWrapperRef: React.RefObject<HTMLDivElement | null>,
        attachFileInputRef: React.RefObject<HTMLInputElement | null>,
        textareaRef: React.RefObject<HTMLTextAreaElement | null>,
        selectedChat: Chat | null,
        allMessages: Message[],
        handleContextMenu: (e: { preventDefault: () => void; pageX: any; pageY: any; }, callback: (setMenuButtons: React.Dispatch<React.SetStateAction<JSX.Element>>) => void) => void,
        loadMessagesOnTop: () => void,
        attachFileChangeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void,
        sendMessage: () => void
    }
): JSX.Element {
    const { user } = useUser();

    const renderMessagesByDate = (messages: Message[] | unknown): JSX.Element => {
        if (!Array.isArray(messages)) return <></>

        const groupDays: Record<string, Message[]> = {};

        for (const m of messages) {
            const key = new Date(m.createdAt).toISOString().split("T")[0];

            groupDays[key] ??= []
            groupDays[key].push(m);
        }

        const keys = Object.keys(groupDays).sort();

        return (
            <>
                {keys.map((date) => (
                    <MessageDayBlock key={date} date={date} messages={groupDays[date]} />
                ))}
            </>
        );
    };

    const MessageDayBlock = React.memo(({ date, messages }: { date: string, messages: Message[] }) => {
        return (
            <div className="message-day-block">
                <div className="day-label">{new Date(date).toLocaleDateString()}</div>
                {messages.slice().reverse().map(m => renderMessage(m))}
            </div>
        );
    });

    const renderMessage = (m: Message): JSX.Element => {
        const isOwnMessage = m.user.id === user?.id;

        const callback = (setMenuButtons: React.Dispatch<React.SetStateAction<JSX.Element>>) => {
            setMenuButtons(<>
                {
                    isOwnMessage && (
                        <button>
                            <span>Edit</span>
                        </button>
                    )
                }
                <button>
                    <span>Copy text</span>
                </button>
                {
                    isOwnMessage && (
                        <button>
                            <span>Delete</span>
                        </button>
                    )
                }
            </>)
        }

        return (
            <div className={`message ${isOwnMessage ? 'own-message' : ''}`} key={m.id} onContextMenu={(e) => props.handleContextMenu(e, callback)}>
                {!isOwnMessage ? <h5 className="sender">{m.user.login}</h5> : ''}
                <div className="message-content">{m.text}</div>
                <div className="time-ago">{new Date(m.createdAt).toLocaleTimeString(
                    'uk-UA',
                    {
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                )}</div>
            </div>
        )
    }

    return (
        <>
            <div className='chat-window'>
                {
                    props.selectedChat
                        ? <>
                            <h2 className='chat-title'>{props.selectedChat.title || props.selectedChat.other_user_login}</h2>
                            <div className="messages-wrapper" ref={props.messagesWrapperRef} onScroll={() => props.loadMessagesOnTop()}>
                                <div className="messages-container">
                                    {renderMessagesByDate(props.allMessages)}
                                </div>
                            </div>
                            <div className="message-textarea-wrapper">
                                <button className='attach-file-btn' onClick={() => {
                                    const fileInput = props.attachFileInputRef.current;
                                    if (fileInput) {
                                        fileInput.value = '';
                                        fileInput.click();
                                    }
                                }}>
                                    <input type="file" multiple className='attach-file-input' hidden ref={props.attachFileInputRef} onChange={props.attachFileChangeHandler} />
                                    <svg
                                        viewBox="0 0 28 28"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12.4797 4.15793C14.6095 0.833113 19.0267 -0.132589 22.3457 2.00098C25.6648 4.13454 26.6288 8.55944 24.4989 11.8843L22.6498 10.6956C24.1243 8.39379 23.4569 5.3304 21.1591 3.85332C18.8614 2.37624 15.8033 3.0448 14.3288 5.3466L12.4797 4.15793Z"
                                            fill="#ffffffff">
                                        </path>
                                        <path d="M14.3278 5.34752L5.1311 19.7042C4.14959 21.2384 4.5946 23.2789 6.12591 24.263C7.65789 25.2475 9.69685 24.8018 10.68 23.2674L13.0534 19.5629L13.0519 19.5619L18.9849 10.3002L18.9863 10.3012C19.4777 9.53391 19.2553 8.51284 18.4894 8.0205C17.7234 7.52814 16.7041 7.751 16.2126 8.51826L16.2111 8.51733L11.5 16.001C11.2118 16.4509 10.6138 16.5814 10.1643 16.2925L9.94284 16.1501C9.49339 15.8612 9.36268 15.2622 9.65088 14.8123L14.3621 7.32857L14.3635 7.3295C15.5104 5.53929 17.8888 5.01934 19.676 6.16816C21.4631 7.317 21.9822 9.69964 20.8354 11.4899L20.8339 11.489L18.4613 15.1927L18.4632 15.1939L12.5297 24.4564C10.891 27.0135 7.49232 27.756 4.93909 26.1152C2.38578 24.4743 1.64432 21.071 3.28299 18.5136L12.4787 4.15885L14.3278 5.34752Z"
                                            fill="#ffffffff">
                                        </path>
                                        <path d="M15.4516 23.7222C15.0022 23.4333 14.8715 22.8343 15.1597 22.3844L22.6473 10.6957L24.4965 11.8844L17.0088 23.5731C16.7206 24.023 16.1226 24.1535 15.6731 23.8646L15.4516 23.7222Z"
                                            fill="#ffffffff">
                                        </path>
                                    </svg>
                                </button>
                                <div className='scroll-block'>
                                    <textarea name="message" className="message-textarea textarea-autosize" placeholder="Повідомлення" ref={props.textareaRef}></textarea>
                                </div>
                                <button className="send-messages-btn" onClick={() => props.sendMessage()}>
                                    <svg fill="#fff" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16,464,496,256,16,48V208l320,48L16,304Z" />
                                    </svg>
                                </button>
                            </div>
                        </>
                        : <div className='select-chat-title'>
                            <span>Select a chat</span>
                        </div>
                }
            </div>
        </>
    )
}