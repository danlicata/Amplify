import { defineFunction } from "@aws-amplify/backend";

export const smartSearch = defineFunction({
	// name: 'smart-search', // Name is derived from the const name
	runtime: 20, // Node.js 20
	entry: "./index.ts", // Points to the file containing the handler
	// handler: 'handler', // Handler function name is often part of entry or defaults
	environment: {
		// These will be placeholders. You'll need to set their actual values
		// in the Amplify console or via environment-specific configurations.
		GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_PLACEHOLDER",
		APP_URL: "YOUR_APP_URL_PLACEHOLDER", // e.g., your deployed frontend URL
	},
	// You can add more configurations here, like memorySize, timeout, etc.
});
