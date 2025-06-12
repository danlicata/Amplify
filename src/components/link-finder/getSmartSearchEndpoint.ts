/**
 * Determines the appropriate API endpoint for the smart search functionality.
 * It returns a relative path for Netlify production builds and a full URL
 * for development or other environments, using environment variables.
 *
 * @returns {string} The calculated API endpoint URL.
 */
export const getSmartSearchEndpoint = (): string => {
	const isNetlify =
		String(import.meta.env.PUBLIC_NETLIFY)
			.toLowerCase()
			.trim() === "true";
	const isAstroDev = import.meta.env.MODE === "development" && !isNetlify;

	// On Netlify production, the functions are proxied.
	if (isNetlify && !isAstroDev) {
		return "/api/smart-search";
	}

	// For local development or other environments, use the full Amplify endpoint.
	const baseUrl =
		import.meta.env.PUBLIC_API_ENDPOINT ||
		"https://s242pttlk5.execute-api.us-east-1.amazonaws.com";

	return `${baseUrl.replace(/\/$/, "")}/api/smart-search`;
};
