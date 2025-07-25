import { createContext, useContext } from "react";
import type { User } from "../types/user";

type UserContextType = {
	user: User | null;
	setUser: (user: User | null) => void;
	logout: () => void
};

export const UserContext = createContext<UserContextType>({
	user: null,
	setUser: () => { },
	logout: () => { }
});

export const useUser = () => useContext(UserContext);