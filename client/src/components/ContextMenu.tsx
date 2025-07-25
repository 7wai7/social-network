import { useState, type JSX } from "react";

export const ContextMenu = ({ x, y, visible, buttons }: { x: number, y: number, visible: boolean, buttons: JSX.Element }): JSX.Element => {

    return (
        visible
            ? <div
                className="context-menu"
                style={{
                    position: 'absolute',
                    top: y,
                    left: x,
                    zIndex: 1000,
                }}
            >
                {buttons}
            </div>
            : <></>
    )

}