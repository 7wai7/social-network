import { useEffect, useState, type JSX } from 'react';
import type { Profile } from '../../types/profile';
import type { Post } from '../../types/post';
import { fetchDeletePost, fetchFollow, fetchProfile, fetchUserPosts } from '../../services/api';
import ProfileUI from '../../ui/ProfileUI';
import { useOutletContext, useParams } from 'react-router-dom';
import type EventEmitter from '../../services/EventEmitter';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

type ContextType = {
    layoutEmitter: EventEmitter
};

export default function Profile(): JSX.Element {
    const context = useOutletContext<ContextType>();
    const queryClient = useQueryClient();

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profile, setProfile] = useState<Profile>();
    const { login } = useParams();

    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['profile'],
        queryFn: ({ pageParam = undefined }: { pageParam: string | undefined }) => {
            if (!login) return [];
            return fetchUserPosts(login, pageParam);
        },
        initialPageParam: undefined,
        getNextPageParam: lastPage => lastPage.at(-1)?.createdAt,
        enabled: !!login
    });

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const height = window.innerHeight;
            if (scrollTop + height > scrollHeight - 1) {
                fetchNextPage();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        console.log(data);
        
    }, [data])

    useEffect(() => {
        if (!login) return;
        setLoadingProfile(true);

        fetchProfile(login)
            .then(data => {
                setProfile(data);
                setLoadingProfile(false);
            })
            .catch((error) => console.error('Помилка при завантаженні профілю:', error))
    }, [login]);

    useEffect(() => {
        const onAddProfilePost = (newPost: Post) => {
            queryClient.setQueryData(['profile'], (oldData: any) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: [
                        [newPost, ...oldData.pages[0]], // вставили на початок першої сторінки
                        ...oldData.pages.slice(1)
                    ]
                };
            });
        }

        context.layoutEmitter.on("add-profile-post", onAddProfilePost);

        return () => {
            context.layoutEmitter.off('add-profile-post', onAddProfilePost);
        };
    }, [profile])


    const handleDeletePost = async (post: Post) => {
        if (!post.isOwnPost) return;

        try {
            fetchDeletePost(post.id)
                .then(() => {
                    queryClient.setQueryData(['profile'], (oldData: any) => {
                        if (!oldData) return oldData;

                        return {
                            ...oldData,
                            pages: oldData.pages.map((page: Post[]) =>
                                page.filter(p => p.id !== post.id)
                            )
                        };
                    });
                })
                .catch(err => console.log(err))
        } catch (err) {
            console.error('Помилка при видаленні:', err);
        }
    };

    const onClickFollowBtn = () => {
        if (!profile) return;

        fetchFollow(profile.user.id)
            .then(data => {
                setProfile(prev => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        isFollowing: data.following
                    };
                });

            })
    }

    return <ProfileUI
        loadingProfile={loadingProfile}
        profile={profile}
        isLoadingPosts={isFetchingNextPage}
        posts={data?.pages.flat() || []}
        onClickFollowBtn={onClickFollowBtn}
        handleDeletePost={handleDeletePost}
    />
}