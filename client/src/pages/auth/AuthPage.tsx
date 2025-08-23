import { useRef, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLogin, fetchRegister } from "../../services/api";
import { useUser } from "../../contexts/UserContext";
import AuthPageUI from "../../ui/AuthPageUI";

export default function AuthPage({ isSignup }: { isSignup: boolean }): JSX.Element {
    const { setUser } = useUser()
    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

    const hideErrors = () => {
        const fields: Field[] = ['login', 'email', 'password'];

        for (const key of fields) {
            const input = inputRefs[key].current;
            const message = messageRefs[key].current;

            if (input && message) {
                input.classList.remove('error');
                message.setAttribute('hidden', '');
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


    const submit = (event: any) => {
        event.preventDefault()
        hideErrors();

        if (isSignup) {
            const body = {
                login: login,
                email: email,
                password: password
            }

            fetchRegister(body)
                .then((data) => {
                    setUser(data);
                    navigate("/");
                })
                .catch((errors) => Array.isArray(errors) ? showErrors(errors) : console.log(errors))
        } else {
            const body = {
                login: login,
                password: password
            }

            fetchLogin(body)
                .then((data) => {
                    console.log(data);
                    setUser(data);
                    navigate("/");
                })
                .catch((errors) => Array.isArray(errors) ? showErrors(errors) : console.log(errors))
        }
    }

    return <AuthPageUI
        login={login}
        email={email}
        password={password}
        setLogin={setLogin}
        setEmail={setEmail}
        setPassword={setPassword}
        isSignup={isSignup}
        inputRefs={inputRefs}
        messageRefs={messageRefs}
        togglePasswordBtnRef={togglePasswordBtnRef}
        togglePassword={togglePassword}
        submit={submit}
    />
}