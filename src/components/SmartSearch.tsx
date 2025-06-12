import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import React, { type FC, useEffect, useState } from "react";

// Add type definition for import.meta.env
interface ImportMetaEnv {
	PUBLIC_API_ENDPOINT?: string;
	PUBLIC_NETLIFY?: string;
	SITE?: string;
	MODE?: string;
	BASE_URL?: string;
	DEV?: boolean;
	PROD?: boolean;
	[key: string]: string | boolean | undefined;
}

declare global {
	interface ImportMeta {
		env: ImportMetaEnv;
	}
}

interface AISearchResultItem {
	url: string;
	description: string;
}

const SmartSearch: FC = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<AISearchResultItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchAttempted, setSearchAttempted] = useState(false);

	// Calculate functionPath synchronously
	const isNetlify =
		String(import.meta.env.PUBLIC_NETLIFY)
			.toLowerCase()
			.trim() === "true";
	const isDev = import.meta.env.DEV;
	const isAstroDev = import.meta.env.MODE === "development" && !isNetlify;
	const baseUrl =
		import.meta.env.PUBLIC_API_ENDPOINT ||
		"https://s242pttlk5.execute-api.us-east-1.amazonaws.com";
	const functionPath =
		isNetlify && !isAstroDev
			? "/api/smart-search" // Use relative path on Netlify production
			: `${baseUrl.replace(/\/$/, "")}/api/smart-search`; // Use Amplify endpoint in dev or non-Netlify

	useEffect(() => {
		// Only log internals during local development
		if (import.meta.env.DEV) {
			console.log("Environment Variables:", {
				PUBLIC_NETLIFY: import.meta.env.PUBLIC_NETLIFY,
				PUBLIC_API_ENDPOINT: import.meta.env.PUBLIC_API_ENDPOINT,
				SITE: import.meta.env.SITE,
				MODE: import.meta.env.MODE,
				BASE_URL: import.meta.env.BASE_URL,
				DEV: import.meta.env.DEV,
				PROD: import.meta.env.PROD,
			});

			console.log("Computed Values:", {
				isNetlify,
				isDev,
				isAstroDev,
				API_ENDPOINT:
					isNetlify && !isAstroDev ? "" : import.meta.env.PUBLIC_API_ENDPOINT,
			});

			// Debug log for FUNCTION_PATH
			console.log("FUNCTION_PATH:", {
				FUNCTION_PATH: functionPath,
				isNetlify,
				isAstroDev,
				PUBLIC_API_ENDPOINT: import.meta.env.PUBLIC_API_ENDPOINT,
			});
		}
	}, [functionPath, isNetlify, isAstroDev]);

	const handleSearch = async () => {
		if (!query.trim()) return;
		if (!functionPath) {
			setError(
				"Search endpoint is not properly configured. Please try again later.",
			);
			return;
		}

		setIsLoading(true);
		setError(null);
		setResults([]); // Clear previous results
		setSearchAttempted(true); // Mark that a search has been attempted

		try {
			console.log("Search Request:", {
				FUNCTION_PATH: functionPath,
			});

			const response = await fetch(functionPath, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query,
					userDetails: {
						firstName: "John",
						lastName: "Doe",
						jobTitle: "Software Engineer",
						component: "Engineering",
						location: "Remote",
					},
				}),
			});

			if (!response.ok) {
				let errorData: { message: string } | undefined;
				try {
					errorData = await response.json();
					console.error("Error response data:", errorData);
				} catch (_e) {
					console.error("Failed to parse error response:", _e);
					errorData = {
						message:
							"Failed to fetch results. Server returned an unreadable error.",
					};
				}
				throw new Error(
					errorData?.message || `HTTP error! status: ${response.status}`,
				);
			}

			const data: { links: AISearchResultItem[] } = await response.json();
			setResults(data.links);
		} catch (err) {
			console.error("Search failed:", err);
			console.error("Error details:", {
				name: err instanceof Error ? err.name : "Unknown",
				message: err instanceof Error ? err.message : String(err),
				stack: err instanceof Error ? err.stack : undefined,
			});
			setError(
				err instanceof Error ? err.message : "An unknown error occurred.",
			);
			setResults([]); // Ensure results are empty on error
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-white shadow-xl rounded-lg p-6 w-full">
			<h2 className="text-2xl font-semibold text-slate-700 mb-4">
				Link Finder
			</h2>
			<div className="flex flex-col sm:flex-row gap-2 mb-4">
				<div className="relative flex-1 min-w-0">
					<MagnifyingGlassIcon
						className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
						aria-hidden="true"
					/>
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && query.trim() !== "") {
								handleSearch();
							}
						}}
						placeholder="e.g., New laptop, Ceiling leak"
						className="w-full p-3 pl-10 border border-slate-300 bg-slate-50 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400 transition-shadow duration-150 ease-in-out"
					/>
				</div>
				<button
					type="button"
					onClick={handleSearch}
					disabled={query.trim() === ""}
					className={`font-semibold p-3 rounded-lg transition-colors transition-transform duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105 w-full sm:w-auto ${
						query.trim() === ""
							? "bg-blue-300 text-white cursor-not-allowed"
							: "bg-blue-600 hover:bg-blue-700 text-white"
					}`}
				>
					Search
				</button>
			</div>
			{isLoading && <p className="text-slate-500">Searching...</p>}
			{error && <p className="text-red-600">Error: {error}</p>}
			{results.length > 0 && !isLoading && !error && (
				<div>
					<h3 className="text-lg font-medium text-slate-800 mb-2">
						Suggested Links:
					</h3>
					<ul className="list-disc pl-5 space-y-1">
						{results.map((result) => (
							<li key={result.url}>
								<a
									href={result.url}
									className="text-blue-700 hover:text-blue-500 hover:underline transition-transform duration-150 ease-in-out hover:scale-105"
									target="_blank"
									rel="noopener noreferrer"
								>
									{result.description}
								</a>
							</li>
						))}
					</ul>
				</div>
			)}
			{searchAttempted &&
				results.length === 0 &&
				query &&
				!isLoading &&
				!error && (
					<p className="text-slate-500">
						No results found for "{query}". Try the AI Bot below.
					</p>
				)}
		</div>
	);
};

export default SmartSearch;
