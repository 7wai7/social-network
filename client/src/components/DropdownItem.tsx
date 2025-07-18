import type { JSX } from "react";


export default function DropdownItem(props: { text: string }): JSX.Element {
    return (
        <>
            <button className="dropdown-item">
                <span>{props.text}</span>
            </button>
        </>
    )
}