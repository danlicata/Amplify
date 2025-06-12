import {
	AcademicCapIcon,
	ComputerDesktopIcon,
	DocumentTextIcon,
	MagnifyingGlassIcon,
	WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import React, {
	type FC,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import type { UserDetails } from "../../types";
import { useSmartSearch } from "./hooks/useSmartSearch";
import SearchTag from "./SearchTag";

interface LinkFinderProps {
	userDetails: UserDetails;
}

const searchTags = [
	{
		label: "Payroll Issue",
		presetQuery: "Payroll Issue",
		icon: <DocumentTextIcon className="h-4 w-4 mr-1" aria-hidden="true" />,
	},
	{
		label: "Employment Verification Letter",
		presetQuery: "Employment Verification Letter",
		icon: <AcademicCapIcon className="h-4 w-4 mr-1" aria-hidden="true" />,
	},
	{
		label: "Hardware Issue",
		presetQuery: "Hardware Issue",
		icon: <ComputerDesktopIcon className="h-4 w-4 mr-1" aria-hidden="true" />,
	},
	{
		label: "Maintenance Request",
		presetQuery: "Maintenance Request",
		icon: <WrenchScrewdriverIcon className="h-4 w-4 mr-1" aria-hidden="true" />,
	},
];

const LinkFinder: FC<LinkFinderProps> = ({ userDetails }) => {
	const [query, setQuery] = useState("");
	const { results, isLoading, error, searchAttempted, handleSearch } =
		useSmartSearch(userDetails);
	const [placeholder] = useState("Search for something...");
	const isInitialMount = useRef(true);
	const [isSearchFocused, setIsSearchFocused] = useState(false);

	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		if (query.trim()) {
			handleSearch(query);
		}
	}, [query, handleSearch]);

	const handleFocus = useCallback(() => {
		setIsSearchFocused(true);
	}, []);

	const handleCloseFocus = useCallback(() => {
		setIsSearchFocused(false);
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				handleCloseFocus();
			}
		};

		if (isSearchFocused) {
			document.addEventListener("keydown", handleKeyDown);
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isSearchFocused, handleCloseFocus]);

	return (
		<div>
			{isSearchFocused && (
				<div
					className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out"
					onClick={handleCloseFocus}
					aria-hidden="true"
				/>
			)}
			<div
				className={`transition-all duration-300 ease-in-out ${
					isSearchFocused
						? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-xl"
						: "relative"
				}`}
			>
				<div className="flex flex-col sm:flex-row gap-2">
					<div className="relative flex-1 min-w-0">
						<label htmlFor="link-finder-search" className="sr-only">
							Search for company resources
						</label>
						<MagnifyingGlassIcon
							className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
							aria-hidden="true"
						/>
						<input
							id="link-finder-search"
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onFocus={handleFocus}
							onKeyDown={(e) => {
								if (e.key === "Enter" && query.trim() !== "") {
									handleSearch(query);
									handleCloseFocus();
								}
							}}
							placeholder={placeholder}
							className="w-full h-12 px-12 border border-slate-300 bg-slate-50 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400 transition-all duration-150 ease-in-out"
						/>
					</div>
					<button
						type="button"
						onClick={() => {
							handleSearch(query);
							handleCloseFocus();
						}}
						disabled={query.trim() === ""}
						aria-label="Search"
						className={`h-12 flex items-center justify-center font-semibold px-5 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:-translate-y-0.5 w-full sm:w-auto cursor-pointer ${
							query.trim() === ""
								? "bg-blue-300 text-white cursor-not-allowed"
								: "bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white"
						}`}
					>
						Search
					</button>
				</div>
			</div>
			{!isSearchFocused && (
				<>
					<div className="mt-4 flex flex-wrap gap-2">
						{searchTags.map((tag) => (
							<SearchTag
								key={tag.label}
								label={tag.label}
								presetQuery={tag.presetQuery}
								icon={tag.icon}
								setQuery={setQuery}
								handleSearch={handleSearch}
							/>
						))}
					</div>

					{isLoading && (
						<div className="mt-8 text-center">
							<output
								className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"
								aria-label="Loading search results"
							>
								<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
									Loading...
								</span>
							</output>
							<p className="mt-4 text-slate-600">
								Searching for the most relevant links...
							</p>
						</div>
					)}

					{error && (
						<div
							className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
							role="alert"
						>
							<p className="font-bold">An error occurred</p>
							<p>{error}</p>
						</div>
					)}

					{!isLoading && searchAttempted && results.length > 0 && (
						<div className="mt-8">
							<h3 className="text-xl font-semibold text-slate-800 mb-4">
								Here are some links that might help:
							</h3>
							<ul className="space-y-4">
								{results.map((item) => (
									<li
										key={item.url}
										className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150"
									>
										<a
											href={item.url}
											target="_blank"
											rel="noopener noreferrer"
											className="block"
										>
											<p className="text-blue-600 hover:underline font-semibold">
												{item.description}
											</p>
											<p className="text-sm text-slate-500 mt-1 truncate">
												{item.url}
											</p>
										</a>
									</li>
								))}
							</ul>
						</div>
					)}

					{!isLoading && searchAttempted && results.length === 0 && !error && (
						<div className="mt-8 text-center bg-slate-50 p-6 rounded-lg border border-slate-200">
							<h3 className="text-lg font-semibold text-slate-700">
								No results found
							</h3>
							<p className="mt-2 text-slate-500">
								We couldn't find any links matching your search. Please try
								again with different keywords.
							</p>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default LinkFinder;
