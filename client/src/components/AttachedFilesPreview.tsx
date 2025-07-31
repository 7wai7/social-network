import { useEffect, useState, type JSX } from "react";
import type { AttachedFile } from "../types/attachedFile";
import "./AttachedFilesPreview.css";
import type EventEmitter from "../services/EventEmitter";
import React from "react";
import { IMAGE_EXTS, VIDEO_EXTS } from "../other/constants";



export default React.memo(function AttachedFilesPreview(
    props: {
        emitter: EventEmitter,
        attachFileInputRef: React.RefObject<HTMLInputElement | null>,
    }
): JSX.Element {
    const [attachedFilesPreview, setAttachedFilesPreview] = useState<AttachedFile[]>([]);

    const ImgElementPreview = ({ url, id }: { url: string, id: string }): JSX.Element => {
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

    const VideoElementPreview = ({ url, id }: { url: string, id: string }): JSX.Element => {
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

    const FileElementPreview = ({ filename, id }: { filename: string, id: string }): JSX.Element => {
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


    const renderAttachedFilesPreview = (): JSX.Element => {
        console.log("renderAttachedMediaFilesPreview");

        const mediaElements: JSX.Element[] = [];
        const filesElements: JSX.Element[] = [];

        attachedFilesPreview.map(({ file, id, url }) => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!ext) return;

            if (IMAGE_EXTS.includes(ext)) {
                mediaElements.push(<ImgElementPreview key={id} url={url} id={id} />);
            } else if (VIDEO_EXTS.includes(ext)) {
                mediaElements.push(<VideoElementPreview key={id} url={url} id={id} />);
            } else {
                filesElements.push(<FileElementPreview key={id} filename={file.name} id={id} />);
            }
        })

        return (
            <>
                {mediaElements.length > 0 && (
                    <div className="media-container">
                        {mediaElements}
                    </div>
                )}
                {filesElements.length > 0 && (
                    <div className="other-files-container">
                        {filesElements}
                    </div>
                )}
            </>
        )
    }


    const removeFileById = (id: string) => {
        const file = attachedFilesPreview.find(file => file.id === id);
        if (file) URL.revokeObjectURL(file.url);
        setAttachedFilesPreview(prev => prev.filter(file => file.id !== id));
    }


    const handleFileChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files).map(file => ({
            file,
            id: crypto.randomUUID(),
            url: URL.createObjectURL(file),
        }));

        setAttachedFilesPreview(prev => [...prev, ...newFiles]);
    };


    useEffect(() => {
        const onSetAttachedFiles = (files: AttachedFile[]) => {
            setAttachedFilesPreview(files);
        }

        props.emitter.on('set-attached-files', onSetAttachedFiles);

        return () => {
            props.emitter.off('set-attached-files', onSetAttachedFiles);
        }
    }, []);

    useEffect(() => {
        console.log('change emitter');

    }, [props.emitter]);

    useEffect(() => {
        props.emitter.emit('get-attached-files', attachedFilesPreview);
    }, [attachedFilesPreview]);

    useEffect(() => {
        if (props.attachFileInputRef.current) {
            props.attachFileInputRef.current.onchange = handleFileChange;
        }
    }, [props.attachFileInputRef]);

    return (
        <div className="attached-files-container preview">
            {renderAttachedFilesPreview()}
        </div>
    )
})