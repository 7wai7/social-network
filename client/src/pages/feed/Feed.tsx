import { useEffect, type JSX } from 'react';
import './Feed.css'
import { fetchFeed } from '../../services/api';
import FeedPost from '../../components/FeedPost';
import { useInfiniteQuery } from '@tanstack/react-query';
import Loader from '../../components/Loader';

export default function Feed(): JSX.Element {
    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['feed'],
        queryFn: ({ pageParam = undefined }: { pageParam: string | undefined }) => {
            return fetchFeed(pageParam, 5);
        },
        initialPageParam: undefined, // Initial value for pageParam
        getNextPageParam: lastPage => lastPage.at(-1)?.createdAt,
    });

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const height = window.innerHeight;
            if (scrollTop + height > scrollHeight - 1) {
                fetchNextPage();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <div className="feed-posts-container">
                {data?.pages.flat().map(post => (
                    <FeedPost key={post.id} post={post} />
                ))}

                {isFetchingNextPage && (<Loader />)}
            </div>
        </>
    );
}