import type { FC, JSX } from 'react';
import './FeedPost.css';
import type { Post } from '../types/post';
import { Link } from 'react-router-dom';
import Dropdown from './Dropdown';
import { fetchUnfollow } from '../services/api';

interface FeedPostProps {
	post: Post;
}

function handlePostFiles(post: Post): JSX.Element {
	const mediaExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'ogg'];
	const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
	const videoExts = ['mp4', 'webm', 'ogg'];

	const mediaFiles = post.files.filter(file => {
		const ext = file.filename.split('.').pop()?.toLowerCase();
		return ext && mediaExts.includes(ext);
	});

	const otherFiles = post.files.filter(file => {
		const ext = file.filename.split('.').pop()?.toLowerCase();
		return !ext || !mediaExts.includes(ext);
	});


	return (
		<>
			{mediaFiles.length > 0 && (
				<div className="media-block">
					{mediaFiles.map((file, index) => {
						const ext = file.filename.split('.').pop()?.toLowerCase();
						const url = `http://localhost:3000/posts/post_${post.id}/${file.filename}`;

						if (!ext) return null;

						if (ext && imageExts.includes(ext)) {
							return (
								<img
									key={index}
									src={url}
									alt={file.filename}
									className="post-image"
									onError={(e) => {
										e.currentTarget.onerror = null; // запобігає нескінченному циклу, якщо fallback теж не знайдеться
										e.currentTarget.src = "/image-load-failed.svg"; // шлях до картинки "Фото не знайдено"
									}}
								/>
							);
						}

						if (ext && videoExts.includes(ext)) {
							return (
								<video
									key={index}
									controls
									className="post-video">
									<source src={url} type={`video/${ext}`} />
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
						const url = `http://localhost:3000/posts/post_${post.id}/${file.filename}`;

						// Файл іншого типу
						return (
							<a
								key={index}
								href={url}
								download={`${file.filename}`}
								className="file-link"
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
								<span className="file-name">{file.filename}</span>
							</a>
						);
					})}
				</div>
			)}
		</>
	)
}

const FeedPost: FC<FeedPostProps> = ({ post }) => {
	return (
		<div className="post">
			<div className='avatar-side'>
				<Link to={`/${post.user.login}`}>
					<img
						src={`http://localhost:3000/avatars/${post.user.login}`}
						alt={`${post.user.login}`}
						className='avatar'
						onError={(e) => {
							e.currentTarget.onerror = null; // запобігає нескінченному циклу, якщо fallback теж не знайдеться
							e.currentTarget.src = "/avatar-load-failed.png"; // шлях до картинки "Фото не знайдено"
						}}
					/>
				</Link>
			</div>
			<div className='content'>
				<div className='post-top'>
					<div className='meta'>
						<Link to={`/${post.user.login}`}>
							<span className='login'>{post.user.login}</span>
						</Link>
						<span className='timestamp'>{new Date(post.createdAt).toLocaleString()}</span>
					</div>
					<Dropdown
						button={
							<div className="options-btn">
								<svg viewBox="0 0 24 24" aria-hidden="true">
									<path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
								</svg>
							</div>
						}
						items={[
							{
								text: `Unfollow ${post.user.login}`,
								onClick: () => {
									console.log(`Unfollow ${post.user.login}`)

									// fetchUnfollow(post.user.id)
									// 	.then(data => console.log(data))
									// 	.catch(err => console.log(err))
								}
							},
							{
								text: 'Report Post',
								onClick: () => {
									console.log(`Report Post`)
								}
							},
						]}
					/>
				</div>
				<Link to={`/${post.user.login}/${post.id}`}>
					<span className='text'>{post.text}</span>
				</Link>
				{post.files ? handlePostFiles(post) : ''}
			</div>
		</div >
	);
};

export default FeedPost;
