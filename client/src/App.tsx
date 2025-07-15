// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import { useEffect } from 'react';
/* import Feed from './pages/Feed.tsx';
import Profile from './pages/Profile.tsx'; */

export default function App() {
	useEffect(() => {
		const listener = (event: Event) => {
			const target = event.target as HTMLElement;
			if (target.matches && target.matches('.textarea-autosize')) {
				const textarea = target as HTMLTextAreaElement;
				textarea.style.height = 'auto';
				textarea.style.height = textarea.scrollHeight/*  Math.max(200, Math.min(textarea.scrollHeight, 600)) */ + 'px';
			}
		};

		document.addEventListener('input', listener);
		return () => document.removeEventListener('input', listener);
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					{/* <Route index element={<Feed />} />
          <Route path="/profile/:id" element={<Profile />} /> */}
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
