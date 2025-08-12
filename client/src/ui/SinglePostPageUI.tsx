import React, { useCallback, useRef, type JSX } from "react";
import "./SinglePostPageUI.css"
import { Link, useNavigate } from "react-router-dom";
import Dropdown from "../components/Dropdown";
import { renderPostFiles } from "../components/FeedPost";
import { timeAgo } from "../other/globals";
import type { Post } from "../types/post";
import Loader from "../components/Loader";
import { useUser } from "../contexts/UserContext";
import Avatar from "../components/Avatar";
import type { Comment } from "../types/comment";
import AttachedFilesPreview from "../components/AttachedFilesPreview";
import type { AttachedFile } from "../types/attachedFile";
import { fetchUnfollow } from "../services/api";
import RenderComment from "../components/RenderComment";

export default function SinglePostPageUI(
    {
        textareaRef,
        textareaText,
        post,
        isLoadingPost,
        comments,
        attachedFilesPreview,
        setAttachedFilesPreview,
        onSubmitComment,
        onKeyDown,
        isFetchingComments,
        setTextareaText,
    }: {
        textareaRef: React.RefObject<HTMLTextAreaElement | null>,
        textareaText: string,
        post?: Post,
        isLoadingPost: boolean,
        comments: Comment[],
        attachedFilesPreview: AttachedFile[],
        setAttachedFilesPreview: React.Dispatch<React.SetStateAction<AttachedFile[]>>,
        onSubmitComment: (event: any) => void,
        onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void,
        isFetchingComments: boolean,
        setTextareaText: React.Dispatch<React.SetStateAction<string>>,
    }
): JSX.Element {
    const navigate = useNavigate();

    const getDropdownItems = useCallback(() => {
        if (!post) return [];

        if (post.isOwnPost) {
            return [];
        }
        return [
            {
                text: `Unfollow ${post.user.login}`,
                onClick: () => {
                    fetchUnfollow(post.user.id).catch(console.error);
                },
            },
            {
                text: "Report Post",
                onClick: () => console.log("Report Post"),
            },
        ];
    }, [post]);

    return (
        <div className="single-post-page">
            <header>
                <button className="back-btn" onClick={() => { navigate(-1) }}>
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        fill="#fff">
                        <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
                    </svg>
                </button>
                <span className="title-text">Post</span>
            </header>
            {<div className="post-block">
                {(isLoadingPost || !post)
                    ? <Loader />
                    : <>
                        <div className="post-header">
                            <Avatar user={post.user} />
                            <div className='post-meta'>
                                <Link to={`/profile/${post.user.login}`}>
                                    <span className='login'>{post.user.login}</span>
                                </Link>
                                <span className='timestamp'>{timeAgo(post.createdAt)}</span>
                            </div>
                            <Dropdown
                                button={
                                    <div className="options-btn">
                                        <svg viewBox="0 0 24 24" aria-hidden="true" fill="#fff">
                                            <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                                        </svg>
                                    </div>
                                }
                                items={getDropdownItems()}
                            />
                        </div>
                        <div className='content'>
                            {post.text?.trim() && (<span className='post-text'>{post.text}</span>)}
                            {renderPostFiles(post.files)}
                        </div>
                    </>
                }
            </div>}
            <div className="comments-block">
                {comments.map(c => <RenderComment key={c.id} c={c} />)}

                {isFetchingComments && (<Loader />)}
            </div>
            <CommentForm
                textareaRef={textareaRef}
                textareaText={textareaText}
                setTextareaText={setTextareaText}
                onSubmitComment={onSubmitComment}
                onKeyDown={onKeyDown}
                attachedFilesPreview={attachedFilesPreview}
                setAttachedFilesPreview={setAttachedFilesPreview}
            />
        </div>
    )
}



const CommentForm = React.memo(({
    textareaRef,
    textareaText,
    setTextareaText,
    onSubmitComment,
    onKeyDown,
    attachedFilesPreview,
    setAttachedFilesPreview,
}: {
    textareaRef: React.RefObject<HTMLTextAreaElement | null>,
    textareaText: string,
    setTextareaText: React.Dispatch<React.SetStateAction<string>>,
    onSubmitComment: (event: any) => void,
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void,
    attachedFilesPreview: AttachedFile[],
    setAttachedFilesPreview: React.Dispatch<React.SetStateAction<AttachedFile[]>>,
}) => {
    const { user } = useUser();
    const attachFilesInputRef = useRef<HTMLInputElement>(null);

    const onClickAttachFile = (e: React.MouseEvent) => {
        e.preventDefault();
        
        const fileInput = attachFilesInputRef.current;
        if (fileInput) {
            fileInput.value = '';
            fileInput.click();
        }
    };

    return (
        <form className="write-comment-form" onSubmit={onSubmitComment}>
            <AttachedFilesPreview
                attachedFilesPreview={attachedFilesPreview}
                setAttachedFilesPreview={setAttachedFilesPreview}
                attachFileInputRef={attachFilesInputRef}
            />
            <div className="form-inputs">
                <input type="file" multiple className='attach-file-input' hidden ref={attachFilesInputRef} />
                {user && (<Avatar user={user} />)}
                <button className='attach-file-btn' onClick={(e) => onClickAttachFile(e)}>
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
                <div className='textarea-scroll-block'>
                    <textarea
                        name="message"
                        className="textarea-autosize"
                        placeholder="Comment"
                        ref={textareaRef}
                        value={textareaText}
                        onChange={(e) => setTextareaText(e.target.value)}
                        onKeyDown={(e) => onKeyDown(e)}
                    ></textarea>
                </div>
                <button className="send-comment-btn" type="submit">
                    <svg fill="#fff" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16,464,496,256,16,48V208l320,48L16,304Z" />
                    </svg>
                </button>
            </div>
        </form>
    );
});