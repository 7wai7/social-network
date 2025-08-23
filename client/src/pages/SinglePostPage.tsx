import { useEffect, useRef, useState, type JSX } from "react";
import SinglePostPageUI from "../ui/SinglePostPageUI";
import { fetchComments, fetchCreateComment, fetchFiles, fetchGetPost } from "../services/api";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import type { File } from "../types/file";
import type { AttachedFile } from "../types/attachedFile";

export default function SinglePostPage(): JSX.Element {

    const { id: postId } = useParams();
    const queryClient = useQueryClient();
    const [textareaText, setTextareaText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [attachedFilesPreview, setAttachedFilesPreview] = useState<AttachedFile[]>([]);


    const {
        data: post,
        isLoading
    } = useQuery({
        queryKey: ['post', postId],
        queryFn: () => {
            if (!postId) return undefined;
            return fetchGetPost(parseInt(postId))
        },
        enabled: !!postId
    })

    const {
        data: comments,
        fetchNextPage: fetchNextComments,
        isFetchingNextPage: isFetchingComments,
    } = useInfiniteQuery({
        queryKey: ['comments', postId],
        queryFn: ({ pageParam = undefined }: { pageParam: string | undefined }) => {
            if (!post) return [];
            return fetchComments(post.id, pageParam, 5);
        },
        initialPageParam: undefined,
        getNextPageParam: lastPage => lastPage.at(-1)?.createdAt,
        enabled: !!post
    });

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const height = window.innerHeight;
            if (scrollTop + height > scrollHeight - 1) {
                fetchNextComments();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const onSubmitComment = (event?: any) => {
        event?.preventDefault();
        if (!postId) return;

        const send = (files: File[] = []) => {
            const comment = {
                post_id: parseInt(postId),
                text: textareaText,
                files
            }

            fetchCreateComment(comment)
                .then(newComment => {
                    queryClient.setQueryData(['comments', postId], (oldData: any) => {
                        if (!oldData) return oldData;

                        return {
                            ...oldData,
                            pages: [
                                [newComment, ...oldData.pages[0]], // поставити на початок першої сторінки
                                ...oldData.pages.slice(1)
                            ]
                        };
                    });

                    setTextareaText('');
                    setAttachedFilesPreview([]);
                })
        }

        if (attachedFilesPreview.length > 0) {
            const formData = new FormData();
            attachedFilesPreview.forEach(({ file, url }) => {
                formData.append('files', file);
                URL.revokeObjectURL(url)
            });

            fetchFiles(formData)
                .then(data => {
                    send(data);
                })
                .catch((error) => console.error('Помилка при завантаженні файлів:', error));
        } else send();
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.code === 'Enter' || e.keyCode === 13) && !e.ctrlKey) {
            e.preventDefault();
            onSubmitComment();
        } else if ((e.code === 'Enter' || e.keyCode === 13) && e.ctrlKey) {
            // перейти на нову строку
            setTextareaText(prev => prev + '\n');
        }
    };


    return <SinglePostPageUI
        post={post}
        isLoadingPost={isLoading}
        comments={comments?.pages.flat() || []}
        isFetchingComments={isFetchingComments}
        attachedFilesPreview={attachedFilesPreview}
        setAttachedFilesPreview={setAttachedFilesPreview}
        textareaRef={textareaRef}
        textareaText={textareaText}
        setTextareaText={setTextareaText}
        onSubmitComment={onSubmitComment}
        onKeyDown={onKeyDown}
    />
}