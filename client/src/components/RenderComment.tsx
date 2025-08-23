import React, { useCallback, type JSX } from "react";
import type { Comment } from "../types/comment";
import Avatar from "./Avatar";
import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";
import { timeAgo } from "../other/globals";
import AttachedFiles from "./AttachedFiles";



const RenderComment = ({ c }: { c: Comment }): JSX.Element => {
    const getCommentDropdownItems = useCallback((c: Comment) => {
        return c.isOwnComment
            ? [{ text: "Delete comment" }]
            : [
                // { text: "Report", onClick: () => console.log("Report comment") }
            ];
    }, []);

    return <>
        <div className="comment">
            <Avatar user={c.user} />
            <div className="comment-content">
                <div className="comment-header">
                    <Link to={`/profile/${c.user.login}`} className="profile-link">{c.user.login}</Link>
                    <span className="comment-time">{timeAgo(c.createdAt)}</span>

                    <Dropdown
                        button={
                            <div className="options-btn">
                                <svg viewBox="0 0 24 24" aria-hidden="true" fill="#fff">
                                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                                </svg>
                            </div>
                        }
                        items={getCommentDropdownItems(c)}
                    />
                </div>
                {c.text.trim() && <div className="comment-text">{c.text}</div>}
                <AttachedFiles attachedFiles={c.files} />
                <div className="comment-bottom">
                    <button className="replies-btn">
                        <svg
                            viewBox="0 0 32 32"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(-204.000000, -255.000000)" fill="#fff">
                                <path d="M228,267 C226.896,267 226,267.896 226,269 C226,270.104 226.896,271 228,271 C229.104,271 230,270.104 230,269 C230,267.896 229.104,267 228,267 L228,267 Z M220,281 C218.832,281 217.704,280.864 216.62,280.633 L211.912,283.463 L211.975,278.824 C208.366,276.654 206,273.066 206,269 C206,262.373 212.268,257 220,257 C227.732,257 234,262.373 234,269 C234,275.628 227.732,281 220,281 L220,281 Z M220,255 C211.164,255 204,261.269 204,269 C204,273.419 206.345,277.354 210,279.919 L210,287 L217.009,282.747 C217.979,282.907 218.977,283 220,283 C228.836,283 236,276.732 236,269 C236,261.269 228.836,255 220,255 L220,255 Z M212,267 C210.896,267 210,267.896 210,269 C210,270.104 210.896,271 212,271 C213.104,271 214,270.104 214,269 C214,267.896 213.104,267 212,267 L212,267 Z M220,267 C218.896,267 218,267.896 218,269 C218,270.104 218.896,271 220,271 C221.104,271 222,270.104 222,269 C222,267.896 221.104,267 220,267 L220,267 Z"></path>
                            </g>
                        </svg>
                    </button>
                    <button className="reply-btn">Reply</button>
                </div>
            </div>
        </div>
    </>
}

export default React.memo(RenderComment, (prev, next) => {
    return prev.c.id === next.c.id;
});