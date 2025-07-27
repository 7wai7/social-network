import { useEffect, useState, type JSX } from 'react';
import type { Profile } from '../../types/profile';
import type { Post } from '../../types/post';
import { fetchDeletePost, fetchProfile, fetchUserPosts } from '../../services/api';
import ProfileUI from '../../ui/ProfileUI';
import { useParams } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

export default function Profile(): JSX.Element {
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profile, setProfile] = useState<Profile>();
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const { login } = useParams();
    const { user } = useUser();

    useEffect(() => {
        if (!login) return;

        fetchProfile(login)
            .then(data => {
                setProfile(data);
                setIsOwnProfile(data.user.id === user?.id);
                setLoadingProfile(false);
            })
            .catch((error) => console.error('Помилка при завантаженні профілю:', error))


        fetchUserPosts(login)
            .then(data => {
                setPosts(data);
                setLoadingPosts(false)
            })
            .catch((error) => console.error('Помилка при завантаженні постів:', error))
    }, [login]);

    const handleDeletePost = async (postId: number) => {
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

    return <ProfileUI
        loadingProfile={loadingProfile}
        profile={profile}
        isOwnProfile={isOwnProfile}
        loadingPosts={loadingPosts}
        posts={posts}
        handleDeletePost={handleDeletePost}
    />
}