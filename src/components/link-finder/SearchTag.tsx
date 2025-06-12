import React, { type FC, type ReactElement } from "react";

interface SearchTagProps {
	label: string;
	presetQuery: string;
	icon: ReactElement;
	setQuery: (query: string) => void;
	handleSearch: (query: string) => void;
}

const SearchTag: FC<SearchTagProps> = ({
	label,
	presetQuery,
	icon,
	setQuery,
	handleSearch,
}) => {
	const handleClick = () => {
		setQuery(presetQuery);
		handleSearch(presetQuery);
	};

	return (
		<button
			type="button"
			aria-label={`Find resources for ${label}`}
			onClick={handleClick}
			className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors duration-150 ease-in-out border border-slate-200 hover:border-slate-300 cursor-pointer flex items-center"
		>
			{icon}
			{label}
		</button>
	);
};

export default SearchTag;
