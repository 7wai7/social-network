import { Outlet } from 'react-router-dom';
import LeftNavBar from './LeftNavBar.tsx';
import PostModal from './PostModal.tsx';
import type { JSX } from 'react';

export default function Layout(): JSX.Element {
    return (
        <>
            <PostModal />
            <LeftNavBar />
            <main>
                <Outlet />
            </main>
        </>
    );
}