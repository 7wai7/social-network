import { useEffect, useRef, useState } from "react";
import { fetchCreatePost, fetchFiles } from "../services/api";
import PostModalUI from "../ui/PostModalUI";
import EventEmitter from "../services/EventEmitter";
import type { AttachedFile } from "../types/attachedFile";

const PostModal = (
    props: {
        layoutEmitter: EventEmitter
    }
) => {
    const postModalEmitterRef = useRef(new EventEmitter());
    const postModalRef = useRef<HTMLDivElement>(null);
    const attachedFilesRef = useRef<AttachedFile[]>([]);

    const [text, setText] = useState('');

    useEffect(() => {
        const onOpenModal = () => {
            postModalRef.current?.removeAttribute('hidden');
        }
        const onCloseModal = () => {
            postModalRef.current?.setAttribute('hidden', '');
            setText('');
            postModalEmitterRef.current.emit('set-attached-files', []);
        }

        const onGetAttachedFiles = (files: AttachedFile[]) => {
            attachedFilesRef.current = files;
        }

        props.layoutEmitter.on('open-post-modal', onOpenModal)
        props.layoutEmitter.on('close-post-modal', onCloseModal)
        postModalEmitterRef.current.on('get-attached-files', onGetAttachedFiles);

        return () => {
            props.layoutEmitter.off('open-post-modal', onOpenModal)
            props.layoutEmitter.off('close-post-modal', onCloseModal)
            postModalEmitterRef.current.off('get-attached-files', onGetAttachedFiles);
        }
    }, [])

    const publishPost = () => {
        if (!text.trim() && attachedFilesRef.current.length == 0) return;

        const formData = new FormData();
        attachedFilesRef.current.forEach(({ file, url }) => {
            formData.append('files', file);
            URL.revokeObjectURL(url)
        });

        fetchFiles(formData)
            .then(data => {
                fetchCreatePost({ text, files: data })
                    .then(post => {
                        props.layoutEmitter.emit('add-profile-post', post);
                        props.layoutEmitter.emit('close-post-modal');
                    })
                    .catch((error) => console.error('Помилка при створенні поста:', error));
            })
            .catch((error) => console.error('Помилка при завантаженні файлів:', error));
    };


    return <PostModalUI
        layoutEmitter={props.layoutEmitter}
        text={text}
        setText={setText}
        postModalRef={postModalRef}
        postModalEmitter={postModalEmitterRef.current}
        publishPost={publishPost}
    />
};

export default PostModal;