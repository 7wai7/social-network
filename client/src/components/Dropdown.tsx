import { useEffect, useRef, useState, type FC, type JSX } from "react";

interface DropdownProps {
    button: JSX.Element;
    items: {
        text: string,
        onClick?: () => void
    }[];
}

const Dropdown: FC<DropdownProps> = ({ button, items }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Обробник кліку поза елементом
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="dropdown-menu-container" ref={dropdownRef}>
            <button className="menu-trigger" onClick={(e) => {
                e.preventDefault();
                setOpen(!open);
            }}>
                {button}
            </button>
            <div className={`dropdown-menu ${open ? 'active' : 'inactive'}`}>
                {items.map((item, index) => (
                    <button key={index} className="dropdown-item" onClick={() => item.onClick ? item.onClick() : {}}>
                        <span>{item.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
export default Dropdown;