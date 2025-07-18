import { useRef, type JSX } from "react";
import "./AuthPage.css"
import { Link, useNavigate } from "react-router-dom";
import { fetchLogin, fetchRegister } from "../../services/api";

export default function AuthPage({ isSignup }: { isSignup: boolean }): JSX.Element {
	const navigate = useNavigate();
    type Field = 'login' | 'email' | 'password';

    const inputRefs = {
        login: useRef<HTMLInputElement>(null),
        email: useRef<HTMLInputElement>(null),
        password: useRef<HTMLInputElement>(null),
    }

    const messageRefs = {
        login: useRef<HTMLSpanElement>(null),
        email: useRef<HTMLSpanElement>(null),
        password: useRef<HTMLSpanElement>(null)
    }

    const togglePasswordBtnRef = useRef<HTMLButtonElement>(null);


    const togglePassword = () => {
        if (!inputRefs.password.current) return;
        togglePasswordBtnRef.current?.classList.toggle('show');
        inputRefs.password.current.type === 'password' ? inputRefs.password.current.type = 'text' : inputRefs.password.current.type = 'password';
    }

    const getRefValue = (ref: React.RefObject<HTMLInputElement | null>) => ref?.current?.value || "";

    const hideErrors = () => {
        const fields: Field[] = ['login', 'email', 'password'];

        for (const key of fields) {
            const input = inputRefs[key].current;
            const message = messageRefs[key].current;

            if (input && message) {
                input.classList.remove('error');
                message.removeAttribute('hidden');
                message.textContent = '';
            }
        }
    }

    const showErrors = (
        errors: {
            field: Field,
            message: string,
            code: string
        }[]
    ) => {
        console.log(errors);

        errors.forEach((err) => {
            const input = inputRefs[err.field].current;
            const message = messageRefs[err.field].current;

            if (input && message) {
                input.classList.add('error');
                message.removeAttribute('hidden');
                message.textContent = err.message;
            }
        });
    }

    const submit = () => {
        hideErrors();

        if (isSignup) {
            const body = {
                login: getRefValue(inputRefs.login),
                email: getRefValue(inputRefs.email),
                password: getRefValue(inputRefs.password)
            }

            fetchRegister(body)
                .then(() => navigate("/"))
                .catch((err) => err.errors ? showErrors(err.errors) : console.log(err))
        } else {
            const body = {
                email: getRefValue(inputRefs.email),
                password: getRefValue(inputRefs.password)
            }

            fetchLogin(body)
                .then(() => navigate("/"))
                .catch((err) => err.errors ? showErrors(err.errors) : console.log(err))
        }
    }

    return (
        <>
            <div className="auth-panel" id="auth-panel">
                <div className="circle circle1"></div>
                <div className="circle circle2"></div>
                <div className="circle circle3"></div>
                <div className="circle circle4"></div>
                <span className="welcome-title">Welcome</span>
                <div className="form">
                    {
                        isSignup
                            ? <h2>Sign up</h2>
                            : <h2>Sign in</h2>
                    }
                    {
                        isSignup
                            ? <div className="input-wrapper">
                                <input type="text" placeholder="login" className="login-input" ref={inputRefs.login} />
                                <span className="message" hidden ref={messageRefs.login}>message</span>
                            </div>
                            : ''
                    }
                    <div className="input-wrapper">
                        <input type="email" placeholder="email" className="email-input" ref={inputRefs.email} />
                        <span className="message" hidden ref={messageRefs.email}>message</span>
                    </div>
                    <div className="input-wrapper">
                        <input type="password" placeholder="password" className="password-input" ref={inputRefs.password} />
                        <button className="show-password-toggle" ref={togglePasswordBtnRef} onClick={() => togglePassword()}>
                            <div className="open-eye">
                                <svg
                                    viewBox="0 0 28 28"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M14 7C9.5 7 5.5 10 3 14C5.5 18 9.5 21 14 21C18.5 21 22.5 18 25 14C22.5 10 18.5 7 14 7ZM14 19C11.2 19 9 16.8 9 14C9 11.2 11.2 9 14 9C16.8 9 19 11.2 19 14C19 16.8 16.8 19 14 19ZM14 11C12.3 11 11 12.3 11 14C11 15.7 12.3 17 14 17C15.7 17 17 15.7 17 14C17 12.3 15.7 11 14 11Z"
                                        fill="#000000"
                                    />
                                </svg>
                            </div>
                            <div className="closed-eye">
                                <svg
                                    viewBox="0 0 28 28"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.6928 1.55018C22.3102 1.32626 21.8209 1.45915 21.6 1.84698L19.1533 6.14375C17.4864 5.36351 15.7609 4.96457 14.0142 4.96457C9.32104 4.96457 4.781 7.84644 1.11993 13.2641L1.10541 13.2854L1.09271 13.3038C0.970762 13.4784 0.967649 13.6837 1.0921 13.8563C3.79364 17.8691 6.97705 20.4972 10.3484 21.6018L8.39935 25.0222C8.1784 25.4101 8.30951 25.906 8.69214 26.1299L9.03857 26.3326C9.4212 26.5565 9.91046 26.4237 10.1314 26.0358L23.332 2.86058C23.553 2.47275 23.4219 1.97684 23.0392 1.75291L22.6928 1.55018ZM18.092 8.00705C16.7353 7.40974 15.3654 7.1186 14.0142 7.1186C10.6042 7.1186 7.07416 8.97311 3.93908 12.9239C3.63812 13.3032 3.63812 13.8561 3.93908 14.2354C6.28912 17.197 8.86102 18.9811 11.438 19.689L12.7855 17.3232C11.2462 16.8322 9.97333 15.4627 9.97333 13.5818C9.97333 11.2026 11.7969 9.27368 14.046 9.27368C15.0842 9.27368 16.0317 9.68468 16.7511 10.3612L18.092 8.00705ZM15.639 12.3137C15.2926 11.7767 14.7231 11.4277 14.046 11.4277C12.9205 11.4277 12 12.3906 12 13.5802C12 14.3664 12.8432 15.2851 13.9024 15.3624L15.639 12.3137Z"
                                        fillRule="evenodd"
                                        fill="#000000">
                                    </path>
                                    <path d="M14.6873 22.1761C19.1311 21.9148 23.4056 19.0687 26.8864 13.931C26.9593 13.8234 27 13.7121 27 13.5797C27 13.4535 26.965 13.3481 26.8956 13.2455C25.5579 11.2677 24.1025 9.62885 22.5652 8.34557L21.506 10.2052C22.3887 10.9653 23.2531 11.87 24.0894 12.9239C24.3904 13.3032 24.3904 13.8561 24.0894 14.2354C21.5676 17.4135 18.7903 19.2357 16.0254 19.827L14.6873 22.1761Z"
                                        clipRule="evenodd"
                                        fill="#000000">
                                    </path>
                                </svg>
                            </div>
                        </button>
                        <span className="message" hidden ref={messageRefs.password}>message</span>
                    </div>
                    {
                        !isSignup ? <button className="forgot-password-btn">Forgot password?</button> : ''
                    }
                    <button className="submit" onClick={() => submit()}>
                        {
                            isSignup
                                ? 'Sign up'
                                : 'Sign in'
                        }
                    </button>
                    {
                        !isSignup ? <Link to="/register" className="no-account-btn">Don't have an account?</Link> : ''
                    }
                </div>
            </div>
        </>
    )
}