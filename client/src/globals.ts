
export let user: { id: string, login: string }

export function setUser(_user: { id: string, login: string }) {
    user = _user;
}