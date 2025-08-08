import { useEffect, useState, type JSX } from 'react';
import './Feed.css'
import { fetchFeed } from '../../services/api';
import type { Post } from '../../types/post';
import FeedPost from '../../components/FeedPost';
import { useQuery } from '@tanstack/react-query';

export default function Feed(): JSX.Element {
	const [posts, setPosts] = useState<Post[]>([]);
    const [hasMorePosts, setHasMorePosts] = useState(true);

	
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['load-profile-posts'],
        queryFn: () => {
            const lasPost = posts.at(-1);
            return fetchFeed(lasPost?.createdAt)
        },
        enabled: hasMorePosts
    })

    useEffect(() => {
        if (data) setPosts(prev => [...prev, ...data]);

        if (Array.isArray(data) && data.length === 0) {
            setHasMorePosts(false);
        }
    }, [data])

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

	return (
		<>
			{isLoading ? (
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