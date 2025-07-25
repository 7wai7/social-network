import { useEffect, useState, type JSX } from "react";
import { fetchLogout, fetchMe } from "../services/api";
import { useNavigate } from "react-router-dom";
import type { User } from "../types/user";
import { UserContext } from "../contexts/UserContext";
import { getSocket } from "../services/socket";

function PrivateRoute({ children }: { children: JSX.Element }) {
	const [checked, setChecked] = useState(false);
	const [isAuthenticated, setAuthenticated] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetchMe()
			.then((data) => {
				setAuthenticated(true);
				setUser(data);
				getSocket()?.connect();
			})
			.catch(() => {
				getSocket()?.disconnect();
				navigate("/login")
			})
			.finally(() => setChecked(true));
	}, []);

	if (!checked) return <>
		<div className="loading-page">
			<div className='loading'>
				<div className='loader'></div>
				<span>Loading...</span>
			</div>
		</div>
	</>;
	if (!isAuthenticated) return null;

	return (
		<UserContext.Provider value={{
			user, setUser, logout: () => {
				fetchLogout()
					.then(() => {
						getSocket()?.disconnect();
						navigate('/login')
					})
					.catch(err => console.log(err))
			},
		}}>
			{children}
		</UserContext.Provider>
	);
}

export default PrivateRoute;