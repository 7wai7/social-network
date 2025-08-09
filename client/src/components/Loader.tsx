import type { JSX } from "react";


export default function Loader(): JSX.Element {
    return <div className='loading'>
        <div className='loader'></div>
        <span>Loading...</span>
    </div>
}