import { useEffect, useRef, useState } from "react";
import { fetchCreatePost, fetchFiles } from "../services/api";
import PostModalUI from "../ui/PostModalUI";
import EventEmitter from "../services/EventEmitter";
import type { AttachedFile } from "../types/attachedFile";
import type { File } from "../types/file";

const PostModal = (
    props: {
        layoutEmitter: EventEmitter
    }
) => {
    const postModalRef = useRef<HTMLDivElement>(null);
    const [attachedFilesPreview, setAttachedFilesPreview] = useState<AttachedFile[]>([]);

    const [text, setText] = useState('');

    useEffect(() => {
        const onOpenModal = () => {
            postModalRef.current?.removeAttribute('hidden');
        }
        const onCloseModal = () => {
            postModalRef.current?.setAttribute('hidden', '');
            setText('');
            setAttachedFilesPreview([]);
        }

        props.layoutEmitter.on('open-post-modal', onOpenModal)
        props.layoutEmitter.on('close-post-modal', onCloseModal)

        return () => {
            props.layoutEmitter.off('open-post-modal', onOpenModal)
            props.layoutEmitter.off('close-post-modal', onCloseModal)
        }
    }, [])

    const publishPost = () => {
        if (!text.trim() && attachedFilesPreview.length == 0) return;

        const publish = (files?: File[]) => {
            fetchCreatePost({ text, files })
                .then(post => {
                    props.layoutEmitter.emit('add-profile-post', post);
                    props.layoutEmitter.emit('close-post-modal');
                })
                .catch((error) => console.error('Помилка при створенні поста:', error));
        }

        if (attachedFilesPreview.length > 0) {
            const formData = new FormData();
            attachedFilesPreview.forEach(({ file, url }) => {
                formData.append('files', file);
                URL.revokeObjectURL(url)
            });

            fetchFiles(formData)
                .then(data => {
                    publish(data);
                })
                .catch((error) => console.error('Помилка при завантаженні файлів:', error));
        } else publish();
    };


    return <PostModalUI
        layoutEmitter={props.layoutEmitter}
        text={text}
        setText={setText}
        postModalRef={postModalRef}
        attachedFilesPreview={attachedFilesPreview}
        setAttachedFilesPreview={setAttachedFilesPreview}
        publishPost={publishPost}
    />
};

export default PostModal;