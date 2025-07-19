import { useEffect, useState, type JSX } from 'react';
import './Feed.css'
import { fetchFeed } from '../../services/api';
import FeedPost from '../../components/FeedPost';
import type { Post } from '../../types/post';

export default function Feed(): JSX.Element {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchFeed()
			.then(setPosts)
			.catch((error) => console.error('Помилка при завантаженні стрічки:', error))
			.finally(() => setLoading(false));
	}, []);

	return (
		<>
			{loading ? (
				<div className='loading'>
					<div className='loader'></div>
					<span>Loading...</span>
				</div>
			) : <div className="content-container">
				{posts.map((post) => <FeedPost key={post.id} post={post} />)}
			</div>}
		</>
	);
}