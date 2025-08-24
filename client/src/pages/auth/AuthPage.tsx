import { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuth } from "../../services/api";
import { useUser } from "../../contexts/UserContext";
import AuthPageUI from "../../ui/AuthPageUI";
import type Auth from "../../types/auth";

export default function AuthPage({ isSignup }: { isSignup: boolean }): JSX.Element {
    const { setUser } = useUser()
    const navigate = useNavigate();
    const [auth, setAuth] = useState<Auth>(
        {
            login: '',
            email: '',
            password: ''
        }
    );

    const initialInputsData = {
        login: {
            isError: false,
            message: ''
        },
        email: {
            isError: false,
            message: ''
        },
        password: {
            isError: false,
            message: ''
        }
    };

    const [inputsData, setInputsData] = useState(initialInputsData);
    const [isShowPassword, setIsShowPassword] = useState(false);

    type Field = 'login' | 'email' | 'password';


    const togglePassword = () => {
        setIsShowPassword(!isShowPassword);
    }

    const showErrors = (
        errors: {
            field: Field,
            message: string,
            code: string
        }[]
    ) => {
        let updated = { ...initialInputsData };
        errors.forEach(err => {
            updated = {
                ...updated,
                [err.field]: {
                    ...updated[err.field],
                    isError: true,
                    message: err.message
                }
            };
        });

        setInputsData(updated);
    }


    const submit = (event: any) => {
        event.preventDefault()
        fetchAuth(auth, isSignup)
            .then((data) => {
                setUser(data);
                navigate("/");
            })
            .catch((errors) => Array.isArray(errors) ? showErrors(errors) : console.log(errors))
    }

    return <AuthPageUI
        auth={auth}
        setAuth={setAuth}
        isSignup={isSignup}
        inputsData={inputsData}
        isShowPassword={isShowPassword}
        togglePassword={togglePassword}
        submit={submit}
    />
}