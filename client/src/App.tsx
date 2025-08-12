// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import { useEffect, type JSX } from 'react';
import Feed from './pages/feed/Feed.tsx';
import Profile from './pages/profile/Profile.tsx';
import Messages from './pages/messages/Messages.tsx';
import Notifications from './pages/notifications/Notifications.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';
import AuthPage from './pages/auth/AuthPage.tsx';
import SinglePostPage from './pages/SinglePostPage.tsx';
import whyDidYouRender from '@welldone-software/why-did-you-render';
import React from 'react';

whyDidYouRender(React, {
  collapseGroups: true,
  include: [/.*/],
  logOnDifferentValues: false,
  trackHooks: false,
  trackAllPureComponents: true
});

export default function App(): JSX.Element {
	useEffect(() => {
		const listener = (event: Event) => {
			const target = event.target as HTMLElement;
			if (target.matches && target.matches('.textarea-autosize')) {
				const textarea = target as HTMLTextAreaElement;
				textarea.style.height = 'auto';
				textarea.style.height = textarea.scrollHeight + 'px';
			}
		};

		document.addEventListener('input', listener);
		return () => document.removeEventListener('input', listener);
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<AuthPage isSignup={ false } />} />
				<Route path="/register" element={<AuthPage isSignup={ true } />} />

				<Route
					path="/"
					element={
						<PrivateRoute>
							<Layout />
						</PrivateRoute>
					}
				>
					<Route index element={<Feed />} />
					<Route path="/notifications" element={<Notifications />} />
					<Route path="/messages" element={<Messages />} />
					<Route path="/profile/:login" element={<Profile />} />
					<Route path="/:login/:id" element={<SinglePostPage />} />
				</Route>

			</Routes>
		</BrowserRouter>
	);
}
