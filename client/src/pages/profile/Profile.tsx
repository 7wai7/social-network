import { useEffect, type JSX } from 'react';
import type { Profile } from '../../types/profile';
import type { Post } from '../../types/post';
import { fetchDeletePost, fetchFollow, fetchProfile, fetchUserPosts } from '../../services/api';
import ProfileUI from '../../ui/ProfileUI';
import { useOutletContext, useParams } from 'react-router-dom';
import type EventEmitter from '../../services/EventEmitter';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

type ContextType = {
    layoutEmitter: EventEmitter
};

export default function Profile(): JSX.Element {
    const context = useOutletContext<ContextType>();
    const queryClient = useQueryClient();
    const { login } = useParams();

    const {
        data: profile,
        isLoading: loadingProfile
    } = useQuery({
        queryKey: ['user-profile', login],
        queryFn: () => fetchProfile(login!),
        enabled: !!login
    });


    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['profile-posts', login],
        queryFn: ({ pageParam = undefined }: { pageParam: string | undefined }) => {
            if (!login) return [];
            return fetchUserPosts(login, pageParam, 2);
        },
        initialPageParam: undefined,
        getNextPageParam: lastPage => lastPage.at(-1)?.createdAt,
        enabled: !!login
    });

    const { ref: viewRef, inView } = useInView();
    useEffect(() => {
        if (inView) fetchNextPage();
    }, [inView, fetchNextPage]);

    useEffect(() => {
        const onAddProfilePost = (newPost: Post) => {
            queryClient.setQueryData(['profile-posts', login], (oldData: any) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: [
                        [newPost, ...oldData.pages[0]], // на початок першої сторінки
                        ...oldData.pages.slice(1)
                    ]
                };
            });
        }

        context.layoutEmitter.on("add-profile-post", onAddProfilePost);

        return () => {
            context.layoutEmitter.off('add-profile-post', onAddProfilePost);
        };
    }, [])


    const handleDeletePost = async (post: Post) => {
        if (!post.isOwnPost) return;

        try {
            fetchDeletePost(post.id)
                .then(() => {
                    queryClient.setQueryData(['profile-posts'], (oldData: any) => {
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
                queryClient.setQueryData(['user-profile', login], (oldData?: Profile) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
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
        viewRef={viewRef}
    />
}