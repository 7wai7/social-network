import { useRef, useState, type JSX } from "react";
import { fetchPost } from "../services/api";
import PostModalUI, { FileElement, ImgElement, VidelElement } from "../ui/PostModalUI";

type SavedFile = {
    file: File;
    id: string;
};

const PostModal = (
    props: {
        postModalRef: React.RefObject<HTMLDivElement | null>
    }
) => {
    const postModalFileInputRef = useRef<HTMLInputElement>(null);
    const postTextareaRef = useRef<HTMLTextAreaElement>(null);
    const mediaContainerRef = useRef<HTMLDivElement>(null);
    const otherFilesContainerRef = useRef<HTMLDivElement>(null);
    const [mediaElements, setMediaElements] = useState<JSX.Element[]>([]);
    const [fileElements, setFileElements] = useState<JSX.Element[]>([]);
    const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);

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
                    <ImgElement key={id} url={url} id={id} removeFileById={removeFileById} />
                );
            } else if (videoExts.includes(ext)) {
                newMediaElements.push(
                    <VidelElement key={id} url={url} id={id} removeFileById={removeFileById} />
                );
            } else {
                newFilesElements.push(
                    <FileElement key={id} filename={file.name} id={id} removeFileById={removeFileById} />
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


    return <PostModalUI
        postModalRef={props.postModalRef}
        postTextareaRef={postTextareaRef}
        mediaContainerRef={mediaContainerRef}
        otherFilesContainerRef={otherFilesContainerRef}
        postModalFileInputRef={postModalFileInputRef}
        mediaElements={mediaElements}
        fileElements={fileElements}
        handleFileChange={handleFileChange}
        publishPost={publishPost}
        closeModal={() => props.postModalRef.current?.setAttribute('hidden', '')}
    />
};

export default PostModal;