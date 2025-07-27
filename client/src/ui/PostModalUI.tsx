import { type JSX } from "react";
import './PostModal.css'

export const ImgElement = ({ url, id, removeFileById }: { url: string, id: string, removeFileById: (id: string) => void }): JSX.Element => {
    return (
        <div className="preview-img">
            <img src={url} />
            <button className="remove-btn" onClick={() => removeFileById(id)}>
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                    </path>
                </svg>
            </button>
        </div>
    )
}

export const VidelElement = ({ url, id, removeFileById }: { url: string, id: string, removeFileById: (id: string) => void }): JSX.Element => {
    return (
        <div className="preview-video">
            <video src={url} controls />
            <button className="remove-btn" onClick={() => removeFileById(id)}>
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                    </path>
                </svg>
            </button>
        </div>
    )
}

export const FileElement = ({ filename, id, removeFileById }: { filename: string, id: string, removeFileById: (id: string) => void }): JSX.Element => {
    return (
        <div className="file-preview">
            <div className="file-icon">
                <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 10h12v1H6zM3 1h12.29L21 6.709V23H3zm12 6h5v-.2L15.2 2H15zM4 22h16V8h-6V2H4zm2-7h12v-1H6zm0 4h9v-1H6z">
                    </path>
                </svg>
            </div>
            <span className="file-name">{filename}</span>
            <button className="remove-btn" onClick={() => removeFileById(id)}>
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                    </path>
                </svg>
            </button>
        </div>
    )
}

export default function PostModal(
    props: {
        postModalRef: React.RefObject<HTMLDivElement | null>,
        postTextareaRef: React.RefObject<HTMLTextAreaElement | null>,
        mediaContainerRef: React.RefObject<HTMLDivElement | null>,
        otherFilesContainerRef: React.RefObject<HTMLDivElement | null>,
        postModalFileInputRef: React.RefObject<HTMLInputElement | null>,
        mediaElements: JSX.Element[],
        fileElements: JSX.Element[],
        handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
        publishPost: () => void,
        closeModal: () => void
    }
): JSX.Element {
    return (
        <>
            <div className="post-modal" hidden ref={props.postModalRef}>
                <div className="panel">
                    <div className="panel-top">
                        <button className="close-modal-btn svg-icon" onClick={() => props.closeModal()}>
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true">
                                <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                                </path>
                            </svg>
                        </button>
                    </div>
                    <div className="scroll-area">
                        <textarea name="post" className="post-textarea textarea-autosize" placeholder="Write a post" ref={props.postTextareaRef}></textarea>
                        <div className="media-container" ref={props.mediaContainerRef}>
                            {props.mediaElements}
                        </div>
                        <div className="other-files-container" ref={props.otherFilesContainerRef}>
                            {props.fileElements}
                        </div>
                    </div>
                    <div className="h-line"></div>
                    <div className="panel-bottom">
                        <button className="file-input-btn" onClick={() => props.postModalFileInputRef.current?.click()}>
                            <input type="file" multiple hidden id="post-modal-file-input" ref={props.postModalFileInputRef} onChange={props.handleFileChange} />
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true">
                                <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z">
                                </path>
                            </svg>
                        </button>
                        <button className="modal-publish-post-btn" onClick={() => props.publishPost()}>
                            <span>Post</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
};