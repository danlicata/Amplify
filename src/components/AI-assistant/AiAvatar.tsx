import { CpuChipIcon } from "@heroicons/react/24/outline";
import React from "react";

interface AiAvatarProps {
	isThinking?: boolean;
	className?: string;
}

const AiAvatar: React.FC<AiAvatarProps> = ({
	isThinking = false,
	className = "",
}) => {
	return (
		<div
			aria-hidden="true"
			className={`relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
        shadow-sm transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-md
        flex items-center justify-center ${className}`}
		>
			<CpuChipIcon className="w-7 h-7 text-white" />

			{/* Thinking animation */}
			{isThinking && (
				<div className="absolute -top-1 -right-1 w-3 h-3">
					<div className="absolute w-full h-full bg-blue-400 rounded-full animate-ping opacity-75" />
					<div className="absolute w-full h-full bg-blue-500 rounded-full" />
				</div>
			)}

			{/* Hover effect ring */}
			<div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />
		</div>
	);
};

export default AiAvatar;
