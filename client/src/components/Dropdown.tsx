import { useEffect, useRef, useState, type FC, type JSX } from "react";
import DropdownItem from "./DropdownItem";

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
            <button className="menu-trigger" onClick={() => setOpen(!open)}>
                {button}
            </button>
            <div className={`dropdown-menu ${open ? 'active' : 'inactive'}`}>
                {items.map((item, index) => (
                    <DropdownItem key={index} text={item.text} onClick={item.onClick} />
                ))}
            </div>
        </div>
    );
}
export default Dropdown;