import { type JSX } from "react";
import FeedPost from "../components/FeedPost";
import type { Profile } from "../types/profile";
import { useUser } from "../contexts/UserContext";
import type { Post } from "../types/post";
import './Profile.css'
import Loader from "../components/Loader";

export default function Profile(
    {
        loadingProfile,
        profile,
        isLoadingPosts,
        posts,
        onClickFollowBtn,
        handleDeletePost,
        viewRef,
    }: {
        loadingProfile: boolean,
        profile: Profile | undefined,
        isLoadingPosts: boolean,
        posts: Post[],
        onClickFollowBtn: () => void,
        handleDeletePost: (post: Post) => void,
        viewRef: (node: Element | null) => void
    }
): JSX.Element {
    const { logout } = useUser();

    return (
        <>
            {loadingProfile || !profile ? (
                <div className='loading'>
                    <div className='loader'></div>
                    <span>Loading...</span>
                </div>
            ) : (
                <div className='profile-block'>
                    <img
                        src={`${profile.bannerUrl}`}
                        alt="banner"
                        className='banner'
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default_profile.png";
                        }}
                    />
                    <div className='profile-avatar-wrapper'>
                        <img
                            src={`${profile.avatarUrl}`}
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
                            profile.isOwnProfile
                                ? <button
                                    className='logout-btn'
                                    onClick={() => logout()}
                                >
                                    <span>Log out</span>
                                </button>
                                : <button
                                    className='follow-btn'
                                    onClick={() => onClickFollowBtn()}
                                >
                                    {
                                        profile.isFollowing
                                            ? <span>Unfollow</span>
                                            : <span>Follow</span>
                                    }
                                </button>
                        }
                        <span className='login'>{profile.user.login}</span>
                        <span className='posts-number'>{profile.postsCount} posts</span>
                        <div className='follow-data'>
                            <span className='number'>{profile.followingCount || 0}</span>
                            <span className='text'>following</span>
                            <span className='number'>{profile.followersCount || 0}</span>
                            <span className='text'>followers</span>
                        </div>
                        {profile.about && (
                            <div className='about'>
                                <span className='about-text'>{profile.about}</span>
                                <button className='show-more-btn'>Show more</button>
                            </div>
                        )}
                    </div>
                    <h2 className='posts-top'>Posts</h2>
                    <div className='h-line'></div>
                    <div className='profile-posts-container'>
                        {posts.map((post) => <FeedPost key={post.id} post={post} handleDeletePost={handleDeletePost} />)}
                        {isLoadingPosts && (<Loader />)}
                        <div ref={viewRef}></div>
                    </div>
                </div>
            )}
        </>
    )
}