import { Outlet } from 'react-router-dom';
import LeftNavBar from './LeftNavBar.tsx';
import PostModal, { type PostModalFun } from './PostModal.tsx';
import { useRef, type JSX } from 'react';
import RightSidebar from './RightSidebar.tsx';

export default function Layout(): JSX.Element {
	const postModalFun = useRef<PostModalFun>({
		open: () => {},
		close: () => {},
	});
    
    return (
        <>
            <PostModal postModalFun={postModalFun}/>
            <LeftNavBar postModalFun={postModalFun}/>
            <main>
                <Outlet />
            </main>
            <RightSidebar/>
        </>
    );
}