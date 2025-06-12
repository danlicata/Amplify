import type { FC, ReactNode } from "react";
import React, { useState } from "react";

interface TooltipProps {
	content: ReactNode;
	children: ReactNode;
}

const Tooltip: FC<TooltipProps> = ({ content, children }) => {
	const [isVisible, setIsVisible] = useState(false);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			setIsVisible(!isVisible);
		} else if (event.key === "Escape") {
			setIsVisible(false);
		}
	};

	return (
		<button
			type="button"
			className="relative inline-block"
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
			onFocus={() => setIsVisible(true)}
			onBlur={() => setIsVisible(false)}
			onKeyDown={handleKeyDown}
			aria-describedby="tooltip"
		>
			{children}
			{isVisible && (
				<div
					id="tooltip"
					className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0 w-max px-2 py-1 bg-slate-700 text-white text-xs rounded-md shadow-lg z-10"
					role="tooltip"
				>
					{content}
					<div
						className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-700"
						style={{ content: "''" }}
					/>
				</div>
			)}
		</button>
	);
};

export default Tooltip;
