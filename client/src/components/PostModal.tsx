import { useEffect, type JSX } from "react";
import './PostModal.css'


export default function PostModal(): JSX.Element {
    useEffect(() => {
        const listener = (event: Event) => {
            const target = event.target as HTMLElement;
            const postModal = target.closest('.post-modal');
            const closeModalBtn = target.closest('.close-modal-btn');
            if (postModal && closeModalBtn) {
                postModal.setAttribute('hidden', '');
            }
        };

        document.addEventListener('click', listener);
        return () => document.removeEventListener('click', listener);
    }, []);

    useEffect(() => {
        const listener = (event: Event) => {
            const target = event.target as HTMLElement;
            const fileInputBtn = target.closest('.file-input-btn');
            if (fileInputBtn) {
                const postModalFileInput = document.getElementById('post-modal-file-input');
                postModalFileInput?.click();
            }
        };

        document.addEventListener('click', listener);
        return () => document.removeEventListener('click', listener);
    }, []);

    return (
        <>
            <div className="post-modal" id="post-modal">
                <div className="panel">
                    <div className="panel-top">
                        <button className="close-modal-btn svg-icon">
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true">
                                <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                                </path>
                            </svg>
                        </button>
                    </div>
                    <div className="scroll-area">
                        <textarea name="post" id="post-textarea" className="post-textarea textarea-autosize" placeholder="Write a post"></textarea>
                        <div className="media-container"></div>
                    </div>
                    <div className="h-line"></div>
                    <div className="panel-bottom">
                        <button className="file-input-btn">
                            <input type="file" hidden id="post-modal-file-input" />
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true">
                                <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z">
                                </path>
                            </svg>
                        </button>
                        <button className="modal-post-btn" id="modal-post-btn">
                            <span>Post</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}