import { defineFunction } from "@aws-amplify/backend";

export const chat = defineFunction({
	name: "chat",
	entry: "./index.ts",
	runtime: 20, // Node.js 20
	environment: {
		GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_PLACEHOLDER",
	},
});
