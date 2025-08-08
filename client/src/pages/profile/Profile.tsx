import { useEffect, useState, type JSX } from 'react';
import type { Profile } from '../../types/profile';
import type { Post } from '../../types/post';
import { fetchDeletePost, fetchFollow, fetchProfile, fetchUserPosts } from '../../services/api';
import ProfileUI from '../../ui/ProfileUI';
import { useOutletContext, useParams } from 'react-router-dom';
import type EventEmitter from '../../services/EventEmitter';
import { useQuery } from '@tanstack/react-query';

type ContextType = {
    layoutEmitter: EventEmitter
};

export default function Profile(): JSX.Element {
    const context = useOutletContext<ContextType>();

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profile, setProfile] = useState<Profile>();

    const [posts, setPosts] = useState<Post[]>([]);
    const [hasMorePosts, setHasMorePosts] = useState(true);

    const { login } = useParams();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['load-profile-posts', login],
        queryFn: () => {
            if (!login) return;
            const lasPost = posts.at(-1);
            return fetchUserPosts(login, lasPost?.createdAt)
        },
        enabled: !!login && hasMorePosts
    })

    useEffect(() => {
        if (data) setPosts(prev => [...prev, ...data]);

        if (Array.isArray(data) && data.length === 0) {
            setHasMorePosts(false);
        }
    }, [data])

    useEffect(() => {
        if (!login) return;
        setLoadingProfile(true);
        setPosts([]);

        fetchProfile(login)
            .then(data => {
                setProfile(data);
                setLoadingProfile(false);
            })
            .catch((error) => console.error('Помилка при завантаженні профілю:', error))
    }, [login]);

    useEffect(() => {
        const onAddProfilePost = (post: Post) => {
            if (profile?.isOwnProfile) setPosts(prev => [post, ...prev]);
        }

        context.layoutEmitter.on("add-profile-post", onAddProfilePost);

        return () => {
            context.layoutEmitter.off('add-profile-post', onAddProfilePost);
        };
    }, [profile])

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const height = window.innerHeight;
            if (scrollTop + height > scrollHeight - 200) {
                refetch();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const handleDeletePost = async (postId: number) => {
        if (!profile?.isOwnProfile) return;

        try {
            fetchDeletePost(postId)
                .then(() => {
                    setPosts(prev => prev.filter(p => p.id !== postId));
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
        loadingPosts={isLoading}
        posts={posts}
        onClickFollowBtn={onClickFollowBtn}
        handleDeletePost={handleDeletePost}
    />
}