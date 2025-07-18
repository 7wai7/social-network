import { useEffect, useRef, useState, type JSX } from "react";
import './PostModal.css'
import { fetchPost } from "../services/api";

export interface PostModalFun {
    open: () => void;
    close: () => void;
}

type SavedFile = {
    file: File;
    id: string;
};

const PostModal = ({ postModalFun }: any) => {
    const postModalRef = useRef<HTMLDivElement>(null);
    const postModalFileInputRef = useRef<HTMLInputElement>(null);
    const postTextareaRef = useRef<HTMLTextAreaElement>(null);
    const mediaContainerRef = useRef<HTMLDivElement>(null);
    const otherFilesContainerRef = useRef<HTMLDivElement>(null);
    const [mediaElements, setMediaElements] = useState<JSX.Element[]>([]);
    const [fileElements, setFileElements] = useState<JSX.Element[]>([]);
    const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);

    useEffect(() => {
        postModalFun.current.open = () => {
            postModalRef.current?.removeAttribute('hidden');
        };
        postModalFun.current.close = () => {
            postModalRef.current?.setAttribute('hidden', '');
        };
    }, [postModalFun]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newFiles = Array.from(files).map(file => ({
            file,
            id: crypto.randomUUID(),
        }));

        setSavedFiles(prev => [...prev, ...newFiles]);

        if (!files || files.length === 0 || !mediaContainerRef.current || !otherFilesContainerRef.current) return;

        const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        const videoExts = ['mp4', 'webm', 'ogg', 'mkv'];
        const newMediaElements: JSX.Element[] = [];
        const newFilesElements: JSX.Element[] = [];

        newFiles.map(({ file, id }) => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!ext) return;

            const url = URL.createObjectURL(file); // створення тимчасового URL

            if (imageExts.includes(ext)) {
                newMediaElements.push(
                    <div key={id} className="preview-img">
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
                );
            } else if (videoExts.includes(ext)) {
                newMediaElements.push(
                    <div key={id} className="preview-video">
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
                );
            } else {
                newFilesElements.push(
                    <div key={id} className="file-preview">
                        <div className="file-icon">
                            <svg
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 10h12v1H6zM3 1h12.29L21 6.709V23H3zm12 6h5v-.2L15.2 2H15zM4 22h16V8h-6V2H4zm2-7h12v-1H6zm0 4h9v-1H6z">
                                </path>
                            </svg>
                        </div>
                        <span className="file-name">{file.name}</span>
                        <button className="remove-btn" onClick={() => removeFileById(id)}>
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true">
                                <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                                </path>
                            </svg>
                        </button>
                    </div>
                );
            }
        });

        setMediaElements(prev => [...prev, ...newMediaElements]);
        setFileElements(prev => [...prev, ...newFilesElements]);
    };

    const removeFileById = (id: string) => {
        setMediaElements(prev => prev.filter(el => el.key !== id));
        setFileElements(prev => prev.filter(el => el.key !== id));
        setSavedFiles(prev => prev.filter(file => file.id !== id));
    }

    const publishPost = () => {
        if (!postTextareaRef.current) return;

        const text = postTextareaRef.current.value;
        const formData = new FormData();

        formData.append('text', text);
        savedFiles.forEach(({ file }) => {
            formData.append('files', file);
        });

        fetchPost(formData)
            .catch((error) => console.error('Помилка при створенні поста:', error));
    };



    return (
        <>
            <div className="post-modal" hidden ref={postModalRef}>
                <div className="panel">
                    <div className="panel-top">
                        <button className="close-modal-btn svg-icon" onClick={() => postModalFun.current.close()}>
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true">
                                <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                                </path>
                            </svg>
                        </button>
                    </div>
                    <div className="scroll-area">
                        <textarea name="post" id="post-textarea" className="post-textarea textarea-autosize" placeholder="Write a post" ref={postTextareaRef}></textarea>
                        <div className="media-container" ref={mediaContainerRef}>
                            {mediaElements}
                        </div>
                        <div className="other-files-container" ref={otherFilesContainerRef}>
                            {fileElements}
                        </div>
                    </div>
                    <div className="h-line"></div>
                    <div className="panel-bottom">
                        <button className="file-input-btn" onClick={() => postModalFileInputRef.current?.click()}>
                            <input type="file" multiple hidden id="post-modal-file-input" ref={postModalFileInputRef} onChange={handleFileChange} />
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
            </div>
        </>
    )
};

export default PostModal;