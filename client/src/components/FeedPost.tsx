import type { FC, JSX } from 'react';
import './FeedPost.css';
import type { Post } from '../types/post';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Dropdown from './Dropdown';
import { IMAGE_EXTS, VIDEO_EXTS } from '../other/constants';
import { fetchUnfollow } from '../services/api';
import { downloadFile, formatBytes, timeAgo } from '../other/globals';
import React from 'react';

interface FeedPostProps {
	post: Post,
	handleDeletePost?: (post: Post) => void | Promise<void> | null
}

function renderPostFiles(post: Post): JSX.Element {
	if(post.files.length === 0) return <></>;

	const mediaExts = [...IMAGE_EXTS, ...VIDEO_EXTS];

	const mediaFiles = post.files.filter(file => {
		const ext = file.originalname.split('.').pop()?.toLowerCase();
		return ext && mediaExts.includes(ext);
	});

	const otherFiles = post.files.filter(file => {
		const ext = file.originalname.split('.').pop()?.toLowerCase();
		return !ext || !mediaExts.includes(ext);
	});


	return (
		<>
			{mediaFiles.length > 0 && (
				<div className="media-block">
					{mediaFiles.map((file, index) => {
						const ext = file.originalname.split('.').pop()?.toLowerCase();
						if (!ext) return null;

						if (ext && IMAGE_EXTS.includes(ext)) {
							return (
								<img
									key={index}
									src={file.url}
									alt={file.originalname}
									className="post-image"
									onError={(e) => {
										e.currentTarget.onerror = null; // запобігає нескінченному циклу, якщо fallback теж не знайдеться
										e.currentTarget.src = "/image-load-failed.svg"; // шлях до картинки "Фото не знайдено"
									}}
								/>
							);
						}

						if (ext && VIDEO_EXTS.includes(ext)) {
							return (
								<video
									key={index}
									controls
									className="post-video">
									<source src={file.url} type={`video/${ext}`} />
									Ваш браузер не підтримує відео.
								</video>
							);
						}
					})}
				</div>
			)}

			{otherFiles.length > 0 && (
				<div className="other-files">
					{otherFiles.map((file, index) => {
						// Файл іншого типу
						return (
							<div
								key={index}
								className="file"
							>
								<div className="file-icon">
									<svg
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg">
										<path d="M6 10h12v1H6zM3 1h12.29L21 6.709V23H3zm12 6h5v-.2L15.2 2H15zM4 22h16V8h-6V2H4zm2-7h12v-1H6zm0 4h9v-1H6z"
											fill='#fff'>
										</path>
									</svg>
								</div>
								<span className="file-name">{file.originalname}
									<span className='file-size'> ({formatBytes(file.size)})</span>
								</span>
								<button className='download-file-btn' onClick={() => downloadFile(file.url, file.originalname)}>
									Download
								</button>
							</div>
						);
					})}
				</div>
			)}
		</>
	)
}

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

	const getDropdownItems = () => {
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
			{
				text: "Report Post",
				onClick: () => console.log("Report Post"),
			},
		];
	};


	return (
		<div className="post" onClick={(e) => onClickPost(e)}>
			{
				!isProfilePage && (
					<div className='avatar-side'>
						<Link to={`/profile/${post.user.login}`}>
							<img
								src={`${post.user.avatarUrl}`}
								alt={`${post.user.login}`}
								className='avatar'
								onError={(e) => {
									e.currentTarget.onerror = null; // запобігає нескінченному циклу, якщо fallback теж не знайдеться
									e.currentTarget.src = "/default_profile.png"; // шлях до картинки "Фото не знайдено"
								}}
							/>
						</Link>
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
						items={getDropdownItems()}
					/>
				</div>
				{post.text.trim() && (<span className='text'>{post.text}</span>)}
				{renderPostFiles(post)}
			</div>
		</div>
	);
};

export default React.memo(FeedPost, (prev, next) => {
	return prev.post.id === next.post.id;
});
