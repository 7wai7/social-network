import { useEffect, type JSX } from 'react';
import './Feed.css'
import { fetchFeed } from '../../services/api';
import FeedPost from '../../components/FeedPost';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Loader from '../../components/Loader';
import { useInView } from 'react-intersection-observer';
import { useOutletContext } from 'react-router-dom';
import type EventEmitter from '../../services/EventEmitter';

type ContextType = {
    layoutEmitter: EventEmitter,
    refreshFeed: boolean,
    setRefreshFeed: React.Dispatch<React.SetStateAction<boolean>>
};

export default function Feed(): JSX.Element {
    const context = useOutletContext<ContextType>();
    const queryClient = useQueryClient();
    
    const {
        data,
        refetch,
        fetchNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['feed'],
        queryFn: ({ pageParam = undefined }: { pageParam: number | undefined }) => {
            context.setRefreshFeed(false);
            return fetchFeed(pageParam, context.refreshFeed);
        },
        initialPageParam: undefined, // Initial value for pageParam
        getNextPageParam: lastPage => lastPage.at(-1)?.id,
    });

    useEffect(() => {
        if(context.refreshFeed) {
            queryClient.resetQueries({ queryKey: ['feed'] });
            refetch()
        }
    }, [context.refreshFeed])

    useEffect(() => {
        console.log(data?.pages);
        
    }, [data])

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