import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import React, { type FC, useEffect, useRef, useState } from "react";

interface UserAvatarProps {
	className?: string;
	showSettings?: boolean;
}

const UserAvatar: FC<UserAvatarProps> = ({
	className = "",
	showSettings = false,
}) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	if (!showSettings) {
		return (
			<img
				src="/jsolly.webp"
				alt="User Avatar"
				className={`w-10 h-10 rounded-full border border-slate-600 flex-shrink-0 ${className}`}
			/>
		);
	}

	return (
		<div className="relative flex items-center" ref={menuRef}>
			<img
				src="/jsolly.webp"
				alt="User Avatar"
				className={`w-10 h-10 rounded-full border border-slate-600 flex-shrink-0 ${className}`}
			/>

			<button
				type="button"
				onClick={() => setIsMenuOpen(!isMenuOpen)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						setIsMenuOpen(!isMenuOpen);
					}
				}}
				className="p-1 rounded-full text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
				aria-label="Open user menu"
				aria-expanded={isMenuOpen}
				aria-haspopup="true"
			>
				<EllipsisVerticalIcon className="h-6 w-6" aria-hidden="true" />
			</button>

			{isMenuOpen && (
				<>
					{/* Backdrop */}
					<button
						type="button"
						className="fixed inset-0 bg-black/30 z-40"
						onClick={() => setIsMenuOpen(false)}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								setIsMenuOpen(false);
							}
						}}
						aria-label="Close menu"
					/>

					{/* Dropdown menu */}
					<div
						className="absolute right-0 mt-2 w-48 rounded-md shadow-md bg-white ring-1 ring-black ring-opacity-5 z-50 transform transition-all duration-200 ease-out origin-top-right top-full"
						role="menu"
						aria-orientation="vertical"
						aria-labelledby="user-menu"
					>
						<div className="py-1" role="none">
							<a
								href="#profile"
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								role="menuitem"
							>
								Your Profile
							</a>
							<a
								href="#settings"
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								role="menuitem"
							>
								Settings
							</a>
							<a
								href="#help"
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								role="menuitem"
							>
								Help
							</a>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default UserAvatar;
