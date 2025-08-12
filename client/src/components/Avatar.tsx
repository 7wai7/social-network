import type { JSX } from "react";
import type { User } from "../types/user";
import { Link } from "react-router-dom";

export default function Avatar(
    props: {
        user: User
    }
): JSX.Element {
    return <Link to={`/profile/${props.user.login}`} className="avatar-link">
        <img
            src={`${props.user.avatarUrl}`}
            alt={`${props.user.login}`}
            className='avatar'
            onError={(e) => {
                e.currentTarget.onerror = null; // запобігає нескінченному циклу, якщо fallback теж не знайдеться
                e.currentTarget.src = "/default_profile.png"; // шлях до картинки "Фото не знайдено"
            }}
        />
    </Link>
}