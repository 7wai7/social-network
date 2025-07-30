import { useEffect, useState, type JSX } from "react";
import "./AttachedFilesPreview.css";
import React from "react";
import type { File } from "../types/file";
import { IMAGE_EXTS, VIDEO_EXTS } from "../other/constants";

export default React.memo(function AttachedFiles(
    props: {
        attachedFiles: File[]
    }
): JSX.Element {
    // const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    const ImgElementPreview = ({ url }: { url: string }): JSX.Element => {
        return (
            <div className="preview-img">
                <img src={url} />
            </div>
        )
    }

    const VideoElementPreview = ({ url }: { url: string }): JSX.Element => {
        return (
            <div className="preview-video">
                <video src={url} controls />
            </div>
        )
    }

    const FileElementPreview = ({ filename }: { filename: string }): JSX.Element => {
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
            </div>
        )
    }


    const renderAttachedFiles = (): JSX.Element => {
        console.log("renderAttachedFiles");

        const mediaElements: JSX.Element[] = [];
        const filesElements: JSX.Element[] = [];

        props.attachedFiles.map((file) => {
            const ext = file.originalname.split('.').pop()?.toLowerCase();
            if (!ext) return;

            if (IMAGE_EXTS.includes(ext)) {
                mediaElements.push(<ImgElementPreview key={file.id} url={file.url} />)
            } else if (VIDEO_EXTS.includes(ext)) {
                mediaElements.push(<VideoElementPreview key={file.id} url={file.url} />);
            } else {
                filesElements.push(<FileElementPreview key={file.id} filename={file.originalname} />);
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


    // useEffect(() => {
    //     if (props.attachedFiles) setAttachedFiles(props.attachedFiles);
    // }, [props.attachedFiles]);

    return (
        <div className="attached-files-container">
            {renderAttachedFiles()}
        </div>
    )
})