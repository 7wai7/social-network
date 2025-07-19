import type { JSX } from "react";


export default function DropdownItem(
    props: {
        text: string,
        onClick: () => void
    }
): JSX.Element {
    return (
        <>
            <button className="dropdown-item" onClick={() => props.onClick()}>
                <span>{props.text}</span>
            </button>
        </>
    )
}