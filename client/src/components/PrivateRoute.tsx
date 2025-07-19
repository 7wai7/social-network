import { useEffect, useState, type JSX } from "react";
import { fetchMe } from "../services/api";
import { useNavigate } from "react-router-dom";
import { setUser } from "../globals";

function PrivateRoute({ children }: { children: JSX.Element }) {
	const [checked, setChecked] = useState(false);
	const [isAuthenticated, setAuthenticated] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		fetchMe()
			.then((data) => {
				setAuthenticated(true);
				setUser(data);
			})
			.catch(() => navigate("/login"))
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

	return children;
}

export default PrivateRoute;