import { useEffect, useState, type JSX } from 'react';
import './Profile.css'
import type { Profile } from '../../types/profile';
import type { Post } from '../../types/post';
import { useLocation, useNavigate } from 'react-router-dom';
import FeedPost from '../../components/FeedPost';
import { fetchDeletePost, fetchLogout, fetchProfile, fetchUserPosts } from '../../services/api';

export default function Profile(): JSX.Element {
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profile, setProfile] = useState<Profile>();
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const location = useLocation();
	const navigate = useNavigate();

    useEffect(() => {
        fetchProfile(location.pathname.split('/')[2]) // получити логін із url
            .then(data => {
                setProfile(data);
                setLoadingProfile(false);
            })
            .catch((error) => console.error('Помилка при завантаженні профілю:', error))


        fetchUserPosts(location.pathname.split('/')[2])
            .then(data => {
                setPosts(data);
                setLoadingPosts(false)
            })
            .catch((error) => console.error('Помилка при завантаженні постів:', error))
    }, []);

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

    return (
        <>
            {loadingProfile ? (
                <div className='loading'>
                    <div className='loader'></div>
                    <span>Loading...</span>
                </div>
            ) : (
                <div className='profile-block'>
                    <img
                        src={`${profile?.bannerUrl}`}
                        alt="banner"
                        className='banner'
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default_profile.png";
                        }}
                    />
                    <div className='profile-avatar-wrapper'>
                        <img
                            src={`${profile?.avatarUrl}`}
                            alt="avatar"
                            className='avatar'
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/default_profile.png";
                            }}
                        />
                    </div>
                    <div className='meta'>
                        <button
                            className='logout-btn'
                            onClick={() => {
                                fetchLogout()
                                    .then(() => navigate('/login'))
                                    .catch(err => console.log(err))
                            }}
                        >
                            <span>Log out</span>
                        </button>
                        <span className='login'>{profile?.user.login}</span>
                        <span className='posts-number'>{profile?.postsNumber} posts</span>
                        <div className='follow-data'>
                            <span className='number'>{profile?.following || 0}</span>
                            <span className='text'>following</span>
                            <span className='number'>{profile?.followers || 0}</span>
                            <span className='text'>followers</span>
                        </div>
                        {profile?.about && (
                            <div className='about'>
                                <span className='about-text'>{profile?.about}</span>
                                <button className='show-more-btn'>Show more</button>
                            </div>
                        )}
                    </div>
                    <h2 className='posts-top'>Posts</h2>
                    <div className='h-line'></div>
                    {loadingPosts ? (
                        <div className='loading'>
                            <div className='loader'></div>
                        </div>
                    ) : (
                        <div className='profile-posts-container'>
                            {posts.map((post) => <FeedPost key={post.id} post={post} handleDeletePost={handleDeletePost} />)}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}