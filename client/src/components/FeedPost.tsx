import type { FC } from 'react';
import './FeedPost.css';
import type { Post } from '../types/post';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Dropdown from './Dropdown';
import { fetchUnfollow } from '../services/api';
import { timeAgo } from '../other/globals';
import React from 'react';
import Avatar from './Avatar';
import AttachedFiles from './AttachedFiles';

interface FeedPostProps {
	post: Post,
	handleDeletePost?: (post: Post) => void
}

const getPostDropdownItems = (post: Post, handleDeletePost?: (post: Post) => void) => {
	const isProfilePage = location.pathname.startsWith('/profile');

	if (isProfilePage && post.isOwnPost) {
		return [
			{
				text: "Delete post",
				onClick: () => handleDeletePost?.(post),
			},
		];
	}
	return [
		{
			text: `Unfollow ${post.user.login}`,
			onClick: () => {
				fetchUnfollow(post.user.id).catch(console.error);
			},
		},
		// {
		// 	text: "Report Post",
		// 	onClick: () => console.log("Report Post"),
		// },
	];
};

const FeedPost: FC<FeedPostProps> = ({ post, handleDeletePost }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const isProfilePage = location.pathname.startsWith('/profile');

	const onClickPost = (e: React.MouseEvent<HTMLElement>) => {
		// Якщо клік по посиланню або кнопці — нічого не робимо (дозволяємо нормальну поведінку)
		const anchor = (e.target as HTMLElement).closest('a, button');
		if (anchor) return;

		// додатково перевірити dropdown, input тощо:
		if ((e.target as HTMLElement).closest('.dropdown-menu-container')) return;

		navigate(`/${post.user.login}/${post.id}`);
	}

	return (
		<div className="post" onClick={(e) => onClickPost(e)}>
			{
				!isProfilePage && (
					<div className='avatar-side'>
						<Avatar user={post.user} />
					</div>
				)
			}

			<div className='content'>
				<div className='post-top'>
					<div className='post-meta'>
						{
							!isProfilePage && (
								<Link to={`/profile/${post.user.login}`}>
									<span className='login'>{post.user.login}</span>
								</Link>
							)
						}
						<span className='timestamp'>{timeAgo(post.createdAt)}</span>
					</div>
					<Dropdown
						button={
							<div className="options-btn">
								<svg viewBox="0 0 24 24" aria-hidden="true">
									<path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
								</svg>
							</div>
						}
						items={getPostDropdownItems(post, handleDeletePost)}
					/>
				</div>
				{post.text?.trim() && (<div className='post-text'>{post.text}</div>)}
				<AttachedFiles attachedFiles={post.files} />
				{post.tags?.length > 0 && (
					<div className="tags-list">
						{post.tags?.map(tag =>
							<Link to={``} className="tag-link" key={tag.name}>#{tag.name}</Link>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default React.memo(FeedPost, (prev, next) => {
	return prev.post.id === next.post.id;
});
