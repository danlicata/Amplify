import type { Context } from "@netlify/functions";
import {
	generateLinksDescription,
	handleAISearchError,
	initializeAI,
	type SearchRequestBody,
	validateSearchRequest,
} from "./helper-funcs.mts";
import { createResponse, getEnv } from "./types";

interface AISearchResultItem {
	url: string;
	description: string;
}

const GEMINI_API_KEY = getEnv("GEMINI_API_KEY");
const { model, isAiAvailable } = initializeAI(GEMINI_API_KEY);

if (isAiAvailable) {
	console.log("AI model initialized successfully for smart-search function");
} else {
	console.warn(
		"AI features will be disabled for smart-search function. Check API key and initialization.",
	);
}

const buildUserContext = (userDetails: SearchRequestBody["userDetails"]) => `
		Current user details:
		- Name: ${userDetails.firstName} ${userDetails.lastName}
		- Job Title: ${userDetails.jobTitle}
		- Component: ${userDetails.component}
		- Work Location: ${userDetails.workLocation}
		- Office: ${userDetails.officeLocation}`;

const ASSISTANT_RULES = `
		IMPORTANT RULES:
		ALWAYS provide direct links with pre-filled parameters when possible`;

const REQUEST_GUIDELINES = `
		When helping with requests:
		1. First, identify which component the request belongs to (IT, HR, or Facilities)
		2. Find the appropriate form in the available resources
		3. Once you have all parameters, provide a direct link with all parameters pre-filled`;

const MATCHING_GUIDELINES = `
		Guidelines for matching:
		1. Prioritize exact keyword matches from the Keywords section
		2. Consider the integration name and description for context
		3. Look for semantic matches in the form descriptions
		4. Consider parameter options as potential matches
		5. Return results in order of relevance`;

const REMINDER_RULES = `
		Remember:
		- ALWAYS provide direct links with pre-filled parameters
		- If the request doesn't match any available forms, return an empty array`;

const RESPONSE_FORMAT = `
		ALWAYS respond with a JSON array of objects, each with a 'url' and 'description' property. Do not include any conversational text or keys other than the array itself. If there are no matches, return an empty array.
		Example:
		[
			{ "url": "https://intranet/forms/laptop", "description": "Request a new laptop" }
		]`;

export default async (req: Request, _context: Context) => {
	try {
		const validation = await validateSearchRequest(req);
		if (validation.error) {
			const { message, status, headers } = validation.error;
			if (status === 200) {
				return createResponse(null, status, headers);
			}
			return createResponse({ error: message }, status, headers);
		}

		if (!validation.body) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Invalid request body" }),
			};
		}
		const { query, userDetails } = validation.body;

		if (!isAiAvailable || !model) {
			return createResponse(
				{
					links: [],
					error:
						"I'm currently in maintenance mode. Please check back later or contact support for immediate assistance.",
					aiDisabled: true,
				},
				503,
			);
		}

		const allLinksDescription = await generateLinksDescription();

		const systemMessage = `
		        You are a Link Finder for an enterprise portal. Your job is to find and return links to internal forms and resources based on the user's query.

				${buildUserContext(userDetails)}

				${ASSISTANT_RULES}

				${REQUEST_GUIDELINES}

				Available resources:
				${allLinksDescription}

				${MATCHING_GUIDELINES}

				${REMINDER_RULES}

				${RESPONSE_FORMAT}`;

		const result = await model.models.generateContent({
			model: "gemini-1.5-flash",
			contents: [
				{
					role: "user",
					parts: [{ text: systemMessage }],
				},
				{
					role: "model",
					parts: [
						{
							text: "Okay, I understand. I will find relevant links and respond with only a JSON array of objects with 'url' and 'description' properties.",
						},
					],
				},
				{
					role: "user",
					parts: [{ text: query }],
				},
			],
			config: {
				responseMimeType: "application/json",
				responseSchema: {
					type: "array",
					items: {
						type: "object",
						properties: {
							url: { type: "string" },
							description: { type: "string" },
						},
						required: ["url", "description"],
					},
				},
			},
		});

		const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!responseText) {
			throw new Error("No valid response text from AI model");
		}

		const linksToClient = JSON.parse(responseText) as AISearchResultItem[];

		return createResponse({
			links: linksToClient,
			error: null,
		});
	} catch (error: unknown) {
		return handleAISearchError(error);
	}
};

export const config = {
	path: "/api/smart-search",
};
