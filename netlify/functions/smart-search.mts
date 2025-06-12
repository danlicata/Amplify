import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import type { Context } from "@netlify/functions";
import { createResponse, getEnv, parseBody } from "./types";

interface FormParamOption {
	value: string | number;
	label: string;
}
interface FormParam {
	name: string;
	type: string;
	description: string;
	required: boolean;
	options?: (string | number | FormParamOption)[];
}

interface FormItemStructure {
	path: string;
	params: FormParam[];
	description: string;
	keywords?: string[]; // Array of keywords for better searchability
}

interface IntegrationStructure {
	name: string;
	description: string;
	baseURL: string;
	forms: FormItemStructure[];
}

interface SearchRequestBody {
	query: string;
	userDetails: {
		firstName: string;
		lastName: string;
		jobTitle: string;
		component: string;
		location: string;
	};
}

// --- AI Initialization ---
const GEMINI_API_KEY = getEnv("GEMINI_API_KEY");
let isAiAvailable = false;
let model: GoogleGenAI | null = null;

if (GEMINI_API_KEY) {
	try {
		model = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
		isAiAvailable = true;
		console.log("AI model initialized successfully for smart-search function");
	} catch (error) {
		console.warn(
			"Failed to initialize AI model. AI features will be disabled for smart-search function.",
			error,
		);
	}
} else {
	console.warn(
		"GEMINI_API_KEY is not defined. AI features will be disabled for smart-search function.",
	);
}

// Cache for links data
let linksDataCache: IntegrationStructure[] | null = null;

// --- fetchLinksData ---
async function fetchLinksData(): Promise<IntegrationStructure[]> {
	// Return cached data if available
	if (linksDataCache !== null) {
		return linksDataCache;
	}

	try {
		const linksPath = fileURLToPath(
			new URL("../../data/links.json", import.meta.url),
		);
		const fileContents = readFileSync(linksPath, "utf-8");
		linksDataCache = JSON.parse(fileContents) as IntegrationStructure[];
		return linksDataCache;
	} catch (error) {
		console.error("Error accessing links.json:", error);
		throw new Error("Failed to load links data");
	}
}

// --- Prompt Templates ---
const buildUserContext = (
	userDetails: SearchRequestBody["userDetails"],
) => `Current user details:
- Name: ${userDetails.firstName} ${userDetails.lastName}
- Job Title: ${userDetails.jobTitle}
- Department: ${userDetails.component}
- Location: ${userDetails.location}`;

const ASSISTANT_RULES = `IMPORTANT RULES:
ALWAYS provide direct links with pre-filled parameters when possible`;

const REQUEST_GUIDELINES = `When helping with requests:
1. First, identify which department the request belongs to (IT, HR, or Facilities)
2. Find the appropriate form in the available resources
3. Once you have all parameters, provide a direct link with all parameters pre-filled`;

const MATCHING_GUIDELINES = `Guidelines for matching:
1. Prioritize exact keyword matches from the Keywords section
2. Consider the integration name and description for context
3. Look for semantic matches in the form descriptions
4. Consider parameter options as potential matches
5. Return results in order of relevance`;

const REMINDER_RULES = `Remember:
- ALWAYS provide direct links with pre-filled parameters
- If the request doesn't match any available forms, return an empty array`;

const RESPONSE_FORMAT = `ALWAYS respond with a JSON array of objects, each with a 'url' and 'description' property. Do not include any conversational text or keys other than the array. If there are no matches, return an empty array.
Example:
[
  { "url": "https://intranet/forms/laptop", "description": "Request a new laptop" },
  { "url": "https://intranet/forms/leave", "description": "Submit a leave request" }
]`;

// --- Main Handler ---
export default async (req: Request, _context: Context) => {
	// Handle OPTIONS request for CORS preflight
	if (req.method === "OPTIONS") {
		return createResponse({}, 200, {
			"Access-Control-Allow-Headers": "Content-Type",
			"Access-Control-Allow-Methods": "POST,OPTIONS",
		});
	}

	// Handle POST request
	if (req.method !== "POST") {
		return createResponse({ error: `Method ${req.method} Not Allowed` }, 405, {
			Allow: "POST,OPTIONS",
		});
	}

	try {
		const body = await parseBody(req);
		if (!body) {
			return createResponse({ error: "Request body is missing" }, 400);
		}

		const { query, userDetails } = body as SearchRequestBody;

		if (!query) {
			return createResponse({ error: "Query is required" }, 400);
		}

		// Defensive check for userDetails and required fields
		const requiredFields = [
			"firstName",
			"lastName",
			"jobTitle",
			"component",
			"location",
		] as const;
		if (
			!userDetails ||
			requiredFields.some(
				(field) =>
					typeof userDetails[field as keyof typeof userDetails] !== "string" ||
					!userDetails[field as keyof typeof userDetails],
			)
		) {
			return createResponse(
				{
					error:
						"userDetails is missing or incomplete. Required fields: firstName, lastName, jobTitle, component, location.",
				},
				400,
			);
		}

		if (!isAiAvailable || !model) {
			return createResponse({
				response:
					"I'm currently in maintenance mode. Please check back later or contact support for immediate assistance.",
				aiDisabled: true,
			});
		}

		const linksData = await fetchLinksData();
		let allLinksDescription = "";

		// Process each integration and its forms
		for (const integration of linksData) {
			allLinksDescription += `Integration: ${integration.name}
Description: ${integration.description}`;

			for (const form of integration.forms) {
				const fullUrl = integration.baseURL.replace(/\/$/, "") + form.path;

				let formDescription = `
- Form: ${form.description}`;

				if (form.keywords && form.keywords.length > 0) {
					formDescription += `
  Keywords: ${form.keywords.join(", ")}`;
				}

				formDescription += `
  URL: ${fullUrl}`;

				if (form.params && form.params.length > 0) {
					formDescription += `
  Parameters:`;
					for (const param of form.params) {
						formDescription += `
    - ${param.name} (${param.type})${param.required ? " [Required]" : ""}: ${param.description}`;
						if (param.options && param.options.length > 0) {
							formDescription += `
      Options: ${param.options
				.map((o) =>
					typeof o === "object" && o !== null
						? ((o as FormParamOption).label ?? (o as FormParamOption).value)
						: String(o),
				)
				.join(", ")}`;
						}
					}
				}

				allLinksDescription += formDescription;
			}
		}

		const systemMessage = `You are a Link Finder for an enterprise portal. Your job is to find and return links to internal forms and resources based on the user's query.

${buildUserContext(userDetails)}

${ASSISTANT_RULES}

${REQUEST_GUIDELINES}

Available resources:
${allLinksDescription}

${MATCHING_GUIDELINES}

${REMINDER_RULES}

${RESPONSE_FORMAT}`;

		const result = await model.models.generateContent({
			model: "gemini-2.0-flash",
			contents: [
				{
					role: "user",
					parts: [{ text: systemMessage }],
				},
				{
					role: "model",
					parts: [
						{
							text: "Okay, I understand my role. I will help users navigate the ticketing portal and provide relevant links based on their queries, asking for more details if needed for parameterized links.",
						},
					],
				},
				{
					role: "user",
					parts: [{ text: query }],
				},
			],
		});

		if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
			throw new Error("No valid response from AI model");
		}
		const responseText = result.candidates[0].content.parts[0].text;

		let linksToClient: unknown = [];
		try {
			// Clean up the response text to ensure it's valid JSON
			const cleanedResponse = responseText
				.replace(/```json\n?|\n?```/g, "")
				.trim();
			const aiJsonOutput = JSON.parse(cleanedResponse);

			// Validate the response structure
			if (Array.isArray(aiJsonOutput)) {
				// Validate each item in the array
				const validLinks = aiJsonOutput.filter(
					(item): item is AISearchResultItem => {
						return (
							typeof item === "object" &&
							item !== null &&
							typeof item.url === "string" &&
							typeof item.description === "string" &&
							item.url.length > 0 &&
							item.description.length > 0
						);
					},
				);

				if (validLinks.length !== aiJsonOutput.length) {
					console.warn("Some items in AI response were invalid:", {
						total: aiJsonOutput.length,
						valid: validLinks.length,
						invalid: aiJsonOutput.length - validLinks.length,
					});
				}

				linksToClient = validLinks;
			} else {
				console.warn("AI response was not an array:", responseText);
				linksToClient = [];
			}
		} catch (parseError) {
			console.error(
				"Error parsing AI JSON response in smart-search function:",
				parseError,
				"Raw response:",
				responseText,
			);
			linksToClient = [];
		}

		// Ensure we always return a valid response structure
		return createResponse({
			links: linksToClient,
			error: null,
		});
	} catch (error: unknown) {
		console.error("Error processing smart-search request:", error);
		const err = error as {
			message?: string;
			status?: number;
			error?: { code?: number; message?: string };
		};

		// Handle specific error cases
		if (
			err.status === 503 ||
			err.error?.code === 503 ||
			err.message?.includes("overloaded")
		) {
			return createResponse({
				links: [],
				error:
					"I'm currently experiencing high demand. Please try again in a few moments.",
				aiDisabled: true,
			});
		}

		if (
			err.status === 429 ||
			err.error?.code === 429 ||
			err.message?.includes("quota")
		) {
			return createResponse({
				links: [],
				error:
					"I've reached my daily limit. Please try again tomorrow or contact support for assistance.",
				aiDisabled: true,
			});
		}

		if (err.message?.includes("API_KEY")) {
			return createResponse({
				links: [],
				error:
					"I'm currently in maintenance mode. Please check back later or contact support for immediate assistance.",
				aiDisabled: true,
			});
		}

		return createResponse(
			{
				links: [],
				error: "Failed to get response from AI model",
			},
			500,
		);
	}
};

// Add type for AI response items
interface AISearchResultItem {
	url: string;
	description: string;
}

export const config = {
	path: "/api/smart-search",
};
