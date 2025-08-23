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
    const [addTagText, setAddTagText] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        const onOpenModal = () => {
            postModalRef.current?.removeAttribute('hidden');
        }
        const onCloseModal = () => {
            postModalRef.current?.setAttribute('hidden', '');
            setText('');
            setAttachedFilesPreview([]);
            setTags([]);
            setAddTagText('');
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
            fetchCreatePost({ text, tags, files })
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


    const onKeydownAddTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(tags.length > 5) return;

        if ((e.code === 'Enter' || e.keyCode === 13)) {
            e.preventDefault();
            setTags(prev => [...prev.filter(tag => tag !== addTagText), addTagText]);
            setAddTagText('');
        }
    }

    const onClickDeleteTag = (deleteTag: string) => {
        setTags(prev => prev.filter(tag => tag !== deleteTag));
    }


    return <PostModalUI
        layoutEmitter={props.layoutEmitter}
        text={text}
        setText={setText}
        addTagText={addTagText}
        setAddTagText={setAddTagText}
        tags={tags}
        onKeydownAddTagInput={onKeydownAddTagInput}
        onClickDeleteTag={onClickDeleteTag}
        postModalRef={postModalRef}
        attachedFilesPreview={attachedFilesPreview}
        setAttachedFilesPreview={setAttachedFilesPreview}
        publishPost={publishPost}
    />
};

export default PostModal;