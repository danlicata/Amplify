import { useCallback, useMemo, useState } from "react";
import type { AISearchResultItem, UserDetails } from "../../../types";
import { getSmartSearchEndpoint } from "../getSmartSearchEndpoint";

export const useSmartSearch = (userDetails: UserDetails) => {
	const [results, setResults] = useState<AISearchResultItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchAttempted, setSearchAttempted] = useState(false);

	const functionPath = useMemo(() => getSmartSearchEndpoint(), []);

	const handleSearch = useCallback(
		async (searchQuery: string) => {
			if (!searchQuery.trim()) return;

			if (!functionPath) {
				setError(
					"Search endpoint is not properly configured. Please try again later.",
				);
				return;
			}

			setIsLoading(true);
			setError(null);
			setResults([]);
			setSearchAttempted(true);

			try {
				const response = await fetch(functionPath, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query: searchQuery,
						userDetails,
					}),
				});

				if (!response.ok) {
					let errorData: { message: string } | undefined;
					try {
						errorData = await response.json();
					} catch (_e) {
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
				setError(
					err instanceof Error ? err.message : "An unknown error occurred.",
				);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		},
		[functionPath, userDetails],
	);

	return { results, isLoading, error, searchAttempted, handleSearch };
};
