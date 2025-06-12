import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import type { HandlerEvent } from "@netlify/functions";
import { createResponse, getMethod, parseBody } from "./types";

interface ErrorWithDetails {
	message?: string;
	status?: number;
	error?: { code?: number; message?: string };
}

interface FormParamOption {
	label: string;
	value: string | number;
}

interface FormParam {
	name: string;
	type: string;
	description: string;
	required: boolean;
	options?: (string | FormParamOption)[];
}

interface FormItemStructure {
	path: string;
	params: FormParam[];
	description: string;
	keywords?: string[];
}

interface IntegrationStructure {
	name: string;
	description: string;
	baseURL: string;
	forms: FormItemStructure[];
}

// Cache for links data
let cachedLinksData: IntegrationStructure[] | undefined;

// --- fetchLinksData (filesystem version with caching) ---
export async function fetchLinksData(): Promise<IntegrationStructure[]> {
	// Return cached data if available
	if (cachedLinksData) {
		return cachedLinksData;
	}

	try {
		const linksPath = fileURLToPath(
			new URL("../../data/links.json", import.meta.url),
		);
		const fileContents = readFileSync(linksPath, "utf-8");
		cachedLinksData = JSON.parse(fileContents) as IntegrationStructure[];
		return cachedLinksData;
	} catch (error) {
		console.error("Error accessing links.json:", error);
		throw new Error("Failed to load links data");
	}
}

// Export interfaces for use in other files
export type {
	FormItemStructure,
	FormParam,
	FormParamOption,
	IntegrationStructure,
};

export function handleAIError(error: unknown): Response {
	console.error("Error processing AI request:", error);
	const err = error as ErrorWithDetails;

	// Handle specific error cases
	if (
		err.status === 503 ||
		err.error?.code === 503 ||
		err.message?.includes("overloaded")
	) {
		return createResponse({
			response:
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
			response:
				"I've reached my daily limit. Please try again tomorrow or contact support for assistance.",
			aiDisabled: true,
		});
	}

	if (err.message?.includes("API_KEY")) {
		return createResponse({
			response:
				"I'm currently in maintenance mode. Please check back later or contact support for immediate assistance.",
			aiDisabled: true,
		});
	}

	return createResponse({ error: "Failed to get response from AI model" }, 500);
}

export function handleAISearchError(error: unknown): Response {
	console.error("Error processing AI search request:", error);
	const err = error as ErrorWithDetails;

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

export interface AIInitialization {
	model: GoogleGenAI | null;
	isAiAvailable: boolean;
}

export function initializeAI(apiKey: string | undefined): AIInitialization {
	let isAiAvailable = false;
	let model: GoogleGenAI | null = null;

	if (apiKey) {
		try {
			model = new GoogleGenAI({ apiKey });
			isAiAvailable = true;
			console.log("AI model initialized successfully");
		} catch (error) {
			console.warn("Failed to initialize AI model:", error);
		}
	} else {
		console.warn("API key is not defined. AI features will be disabled.");
	}

	return { model, isAiAvailable };
}

interface ChatRequestBody {
	message: string;
	history: Array<{
		role: "user" | "model";
		parts: Array<{ text: string }>;
	}>;
	userDetails: {
		firstName: string;
		lastName: string;
		jobTitle: string;
		component: string;
		workLocation: string;
		officeLocation: string;
	};
}

export async function validateChatRequest(req: HandlerEvent): Promise<{
	body?: ChatRequestBody;
	error?: { message: string; status: number; headers?: Record<string, string> };
}> {
	if (getMethod(req) !== "POST") {
		return {
			error: {
				message: `Method ${getMethod(req)} Not Allowed`,
				status: 405,
				headers: { Allow: "POST" },
			},
		};
	}

	const body = await parseBody(req);
	if (!body) {
		return {
			error: {
				message: "Request body is missing",
				status: 400,
			},
		};
	}

	const { message, history, userDetails } = body as ChatRequestBody;

	if (!message) {
		return {
			error: {
				message: "Message is required",
				status: 400,
			},
		};
	}

	if (!userDetails || typeof userDetails !== "object") {
		return {
			error: {
				message: "User details are required",
				status: 400,
			},
		};
	}

	const requiredFields = [
		"firstName",
		"lastName",
		"jobTitle",
		"component",
		"workLocation",
		"officeLocation",
	];
	const missingFields = requiredFields.filter(
		(field) => !userDetails[field] || typeof userDetails[field] !== "string",
	);

	if (missingFields.length > 0) {
		return {
			error: {
				message: `Missing or invalid user details: ${missingFields.join(", ")}`,
				status: 400,
			},
		};
	}

	return { body: { message, history, userDetails } };
}

export interface SearchRequestBody {
	query: string;
	userDetails: {
		firstName: string;
		lastName: string;
		jobTitle: string;
		component: string;
		workLocation: string;
		officeLocation: string;
	};
}

export async function validateSearchRequest(req: Request): Promise<{
	body?: SearchRequestBody;
	error?: { message: string; status: number; headers?: Record<string, string> };
}> {
	if (req.method === "OPTIONS") {
		return {
			error: {
				message: "",
				status: 200,
				headers: {
					"Access-Control-Allow-Headers": "Content-Type",
					"Access-Control-Allow-Methods": "POST,OPTIONS",
				},
			},
		};
	}

	if (req.method !== "POST") {
		return {
			error: {
				message: `Method ${req.method} Not Allowed`,
				status: 405,
				headers: { Allow: "POST,OPTIONS" },
			},
		};
	}

	const body = await parseBody(req);
	if (!body) {
		return {
			error: {
				message: "Request body is missing",
				status: 400,
			},
		};
	}

	const { query, userDetails } = body as SearchRequestBody;

	if (!query) {
		return {
			error: {
				message: "Query is required",
				status: 400,
			},
		};
	}

	if (!userDetails || typeof userDetails !== "object") {
		return {
			error: {
				message: "User details are required",
				status: 400,
			},
		};
	}

	const requiredFields = [
		"firstName",
		"lastName",
		"jobTitle",
		"component",
		"workLocation",
		"officeLocation",
	];
	const missingFields = requiredFields.filter(
		(field) =>
			!userDetails[field as keyof typeof userDetails] ||
			typeof userDetails[field as keyof typeof userDetails] !== "string",
	);

	if (missingFields.length > 0) {
		return {
			error: {
				message: `Missing or invalid user details: ${missingFields.join(", ")}`,
				status: 400,
			},
		};
	}

	return { body: { query, userDetails } };
}

/**
 * Generates a formatted description of all available links and forms
 * @returns A formatted string describing all available links and forms
 */
export async function generateLinksDescription(): Promise<string> {
	const linksData = await fetchLinksData();
	let allLinksDescription = "";

	// Process each integration and its forms
	for (const integration of linksData) {
		const integrationLines = [
			`Integration: ${integration.name}`,
			`Description: ${integration.description}`,
		];

		for (const form of integration.forms) {
			const fullUrl = integration.baseURL.replace(/\/$/, "") + form.path;
			const formLines = [`  - Form: ${form.description}`];

			// Add keywords if they exist
			if (form.keywords && form.keywords.length > 0) {
				formLines.push(`    Keywords: ${form.keywords.join(", ")}`);
			}

			// Add URL
			formLines.push(`    URL: ${fullUrl}`);

			// Add parameters with their options
			if (form.params && form.params.length > 0) {
				formLines.push("    Parameters:");
				for (const param of form.params) {
					formLines.push(
						`      - ${param.name} (${param.type})${
							param.required ? " [Required]" : ""
						}: ${param.description}`,
					);
					if (param.options && param.options.length > 0) {
						formLines.push(
							`        Options: ${param.options
								.map((o) =>
									typeof o === "object" && o !== null
										? (o.label ?? String(o.value))
										: String(o),
								)
								.join(", ")}`,
						);
					}
				}
			}

			integrationLines.push(formLines.join("\n"));
		}

		allLinksDescription += `${integrationLines.join("\n")}\n`;
	}

	return allLinksDescription;
}
