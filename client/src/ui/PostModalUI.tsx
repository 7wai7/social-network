import { useRef, type JSX } from "react";
import './PostModal.css'
import type EventEmitter from "../services/EventEmitter";
import AttachedFilesPreview from "../components/AttachedFilesPreview";
import type { AttachedFile } from "../types/attachedFile";

export default function PostModal(
    {
        layoutEmitter,
        attachedFilesPreview,
        setAttachedFilesPreview,
        text,
        setText,
        addTagText,
        setAddTagText,
        tags,
        onKeydownAddTagInput,
        onClickDeleteTag,
        postModalRef,
        publishPost,
    }: {
        layoutEmitter: EventEmitter,
        attachedFilesPreview: AttachedFile[],
        setAttachedFilesPreview: React.Dispatch<React.SetStateAction<AttachedFile[]>>,
        text: string,
        setText: React.Dispatch<React.SetStateAction<string>>,
        addTagText: string,
        setAddTagText: React.Dispatch<React.SetStateAction<string>>,
        tags: string[],
        onKeydownAddTagInput: (e: React.KeyboardEvent<HTMLInputElement>) => void,
        onClickDeleteTag: (deleteTag: string) => void,
        postModalRef: React.RefObject<HTMLDivElement | null>,
        publishPost: () => void,
    }
): JSX.Element {
    const attachFilesInputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <div className="post-modal" hidden ref={postModalRef}>
                <div className="panel">
                    <div className="panel-top">
                        <button className="close-modal-btn svg-icon" onClick={() => layoutEmitter.emit('close-post-modal')}>
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true">
                                <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                                </path>
                            </svg>
                        </button>
                    </div>
                    <div className="scroll-area">
                        <textarea name="post" className="post-textarea textarea-autosize" placeholder="Write a post" value={text} onChange={(e) => setText(e.target.value)}></textarea>

                        <AttachedFilesPreview
                            attachedFilesPreview={attachedFilesPreview}
                            setAttachedFilesPreview={setAttachedFilesPreview}
                            attachFileInputRef={attachFilesInputRef}
                        />
                    </div>
                    <div className="tags-list">
                        {tags.map(tag =>
                            <button className="tag-btn" key={tag} onClick={() => onClickDeleteTag(tag)}>{tag}</button>
                        )}
                        {tags.length < 5 && (
                            <div className="add-tag-input-wrapper">
                                <input className="add-tag-input" type="text" placeholder="Add tag" value={addTagText} onChange={(e) => setAddTagText(e.target.value)} onKeyDown={(e) => onKeydownAddTagInput(e)} />
                                {tags.length === 0 && (
                                    <div className="add-tag-hint">&#x2190; Add tags so more people will see your post</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="h-line"></div>
                    <div className="panel-bottom">
                        <button className="file-input-btn" onClick={() => {
                            const fileInput = attachFilesInputRef.current;
                            if (fileInput) {
                                fileInput.value = '';
                                fileInput.click();
                            }
                        }}>
                            <input type="file" multiple hidden id="post-modal-file-input" ref={attachFilesInputRef} />
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true">
                                <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z">
                                </path>
                            </svg>
                        </button>
                        <button className="modal-publish-post-btn" onClick={() => publishPost()}>
                            <span>Post</span>
                        </button>
                    </div>
                </div>
            </div >
        </>
    )
};