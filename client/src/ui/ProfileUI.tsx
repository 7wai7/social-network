import { type JSX } from "react";
import FeedPost from "../components/FeedPost";
import type { Profile } from "../types/profile";
import { useUser } from "../contexts/UserContext";
import type { Post } from "../types/post";
import './Profile.css'

export default function Profile(
    props: {
        loadingProfile: boolean,
        profile: Profile | undefined,
        isOwnProfile: boolean,
        loadingPosts: boolean,
        posts: Post[],
        handleDeletePost: (postId: number) => void
    }
): JSX.Element {
    const { logout } = useUser();

    return (
        <>
            {props.loadingProfile ? (
                <div className='loading'>
                    <div className='loader'></div>
                    <span>Loading...</span>
                </div>
            ) : (
                <div className='profile-block'>
                    <img
                        src={`${props.profile?.bannerUrl}`}
                        alt="banner"
                        className='banner'
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default_profile.png";
                        }}
                    />
                    <div className='profile-avatar-wrapper'>
                        <img
                            src={`${props.profile?.avatarUrl}`}
                            alt="avatar"
                            className='avatar'
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/default_profile.png";
                            }}
                        />
                    </div>
                    <div className='meta'>
                        {
                            props.isOwnProfile && (
                                <button
                                    className='logout-btn'
                                    onClick={() => logout()}
                                >
                                    <span>Log out</span>
                                </button>
                            )
                        }
                        <span className='login'>{props.profile?.user.login}</span>
                        <span className='posts-number'>{props.profile?.postsNumber} posts</span>
                        <div className='follow-data'>
                            <span className='number'>{props.profile?.following || 0}</span>
                            <span className='text'>following</span>
                            <span className='number'>{props.profile?.followers || 0}</span>
                            <span className='text'>followers</span>
                        </div>
                        {props.profile?.about && (
                            <div className='about'>
                                <span className='about-text'>{props.profile?.about}</span>
                                <button className='show-more-btn'>Show more</button>
                            </div>
                        )}
                    </div>
                    <h2 className='posts-top'>Posts</h2>
                    <div className='h-line'></div>
                    {props.loadingPosts ? (
                        <div className='loading'>
                            <div className='loader'></div>
                        </div>
                    ) : (
                        <div className='profile-posts-container'>
                            {props.posts.map((post) => <FeedPost key={post.id} post={post} handleDeletePost={props.handleDeletePost} />)}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}