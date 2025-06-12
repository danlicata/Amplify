import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import React, { memo } from "react";
import type { ItemType } from "./types/active-item";

interface SearchFilterBarProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	isFilterOpen: boolean;
	setIsFilterOpen: (isOpen: boolean) => void;
	selectedType: ItemType | null;
	setSelectedType: (type: ItemType | null) => void;
	uniqueTypes: ItemType[];
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
	searchQuery,
	setSearchQuery,
	isFilterOpen,
	setIsFilterOpen,
	selectedType,
	setSelectedType,
	uniqueTypes,
}) => {
	return (
		<div className="flex flex-col sm:flex-row gap-4">
			<div className="relative flex-grow">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<MagnifyingGlassIcon
						className="h-5 w-5 text-slate-400"
						aria-hidden="true"
					/>
				</div>
				<input
					type="text"
					placeholder="Search active items..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					aria-label="Search active items"
				/>
			</div>
			<div className="relative">
				<button
					type="button"
					onClick={() => setIsFilterOpen(!isFilterOpen)}
					className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transform hover:-translate-y-0.5 transition-all duration-150 ease-in-out"
					aria-label="Open filter menu"
				>
					<FunnelIcon
						className="h-5 w-5 mr-2 text-slate-400"
						aria-hidden="true"
					/>
					Filter
					{selectedType && (
						<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
							{selectedType}
						</span>
					)}
				</button>
				{isFilterOpen && (
					<div className="absolute right-0 mt-2 w-56 rounded-md shadow-md bg-white ring-1 ring-black ring-opacity-5 z-10">
						<div className="py-1" role="menu" aria-orientation="vertical">
							<button
								type="button"
								onClick={() => {
									setSelectedType(null);
									setIsFilterOpen(false);
								}}
								className={`block w-full text-left px-4 py-2 text-sm ${
									selectedType === null
										? "bg-slate-100 text-slate-900"
										: "text-slate-700 hover:bg-slate-50"
								}`}
								role="menuitem"
							>
								All Types
							</button>
							{uniqueTypes.map((type) => (
								<button
									type="button"
									key={type}
									onClick={() => {
										setSelectedType(type);
										setIsFilterOpen(false);
									}}
									className={`block w-full text-left px-4 py-2 text-sm ${
										selectedType === type
											? "bg-slate-100 text-slate-900"
											: "text-slate-700 hover:bg-slate-50"
									}`}
									role="menuitem"
								>
									{type}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default memo(SearchFilterBar);
