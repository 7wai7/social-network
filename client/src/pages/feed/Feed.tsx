import { useEffect, type JSX } from 'react';
import './Feed.css'
import { fetchFeed } from '../../services/api';
import FeedPost from '../../components/FeedPost';
import { useInfiniteQuery } from '@tanstack/react-query';
import Loader from '../../components/Loader';
import { useInView } from 'react-intersection-observer';

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

    const { ref: viewRef, inView } = useInView();
    useEffect(() => {
        if (inView) fetchNextPage();
    }, [inView, fetchNextPage]);

    return (
        <>
            <div className="feed-posts-container">
                {data?.pages.flat().map(post => (
                    <FeedPost key={post.id} post={post} />
                ))}

                {isFetchingNextPage && (<Loader />)}
                <div ref={viewRef}></div>
            </div>
        </>
    );
}