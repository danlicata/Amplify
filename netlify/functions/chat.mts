import type { Context, HandlerEvent } from "@netlify/functions";
import {
	generateLinksDescription,
	handleAIError,
	initializeAI,
	validateChatRequest,
} from "./helper-funcs.mts";
import { createResponse, getEnv } from "./types";

// --- Interfaces (copied from original) ---
interface HistoryItem {
	role: "user" | "model";
	parts: Array<{ text: string }>;
}

interface ChatRequestBody {
	message: string;
	history: HistoryItem[];
	userDetails: {
		firstName: string;
		lastName: string;
		jobTitle: string;
		component: string;
		workLocation: string;
		officeLocation: string;
	};
}

const GEMINI_API_KEY = getEnv("GEMINI_API_KEY");
const { model, isAiAvailable } = initializeAI(GEMINI_API_KEY);

const buildUserContext = (
	userDetails: ChatRequestBody["userDetails"],
) => `Current user details:
		- Name: ${userDetails.firstName} ${userDetails.lastName}
		- Job Title: ${userDetails.jobTitle}
		- Component: ${userDetails.component}
		- Work Location: ${userDetails.workLocation}
		- Office: ${userDetails.officeLocation}`;

const ASSISTANT_RULES = `
		IMPORTANT RULES:
		1. Response Format:
		   - Use direct conversational messages
		   - Keep responses concise and professional
		   - Acknowledge information already provided by the user
		   - Only ask for missing required information
		   - NEVER ask for information that's already been provided
		   - NEVER format links in markdown - provide the raw URL only

		2. Information Handling:
		   - NEVER ask for information already provided by the user
		   - NEVER ask for information already in user details (name, component, work location, office location)
		   - Only ask for required information specific to the request
		   - Prioritize exact keyword matches when finding forms
		   - Consider semantic matches in form descriptions
		   - If user provides partial information, acknowledge it and only ask for remaining required fields
		   - If a user's message contains the type of hardware (e.g., "printer," "laptop"), the 'hardwareType' parameter is considered fulfilled; DO NOT ask for it again.

		3. Link Management:
		   - ALWAYS provide direct links with pre-filled parameters
		   - NEVER include empty parameters in URLs
		   - Do not handle form submissions or track status
		   - If no matching form exists, suggest contacting the appropriate component
		   - NEVER format links in markdown - provide the raw URL only`;

const COMMON_SCENARIOS = `COMMON SCENARIOS:
		1. For IT hardware issues:
		- You already have: user's name, component, work location, and office location
		- IMPORTANT: If a user mentions a specific hardware like "printer" or "laptop," the 'hardwareType' parameter is considered fulfilled. You MUST NOT ask for the hardware type again.
		- For printers:
		  * Required information: asset tag (if available), printer model (if available), what's wrong with the printer
		  * If user mentions a specific issue (e.g., "paper jam"), acknowledge it and only ask for remaining required information
		  * Example: "I see you're having a paper jam issue with your printer. Could you please provide the asset tag and printer model?"
		  * If user hasn't described the issue: "Could you tell me what's wrong with the printer?"
		- After getting all details: Provide a direct link to the IT hardware issue form with all parameters pre-filled
		- Example URL format: https://it-ticketing.com/hardware/issue?hardwareType=printer&printerModel=dell&printerIssueType=paper_jam&userComments=paper_jam_error

		2. For security badge issues:
		- You already have: user's name, component, work location, and office location
		- Only ask for: type of badge issue
		- Example: "What's the issue with your security badge (lost, stolen, or malfunctioning)?"
		- After getting details: Provide a direct link to the badge issue form with all parameters pre-filled
		- Example URL format: https://security-ticketing.com/security/badge-issue?issueType=lost

		3. For facilities maintenance:
		- You already have: user's name, component, work location, and office location
		- Only ask for: issue type and urgency level
		- Example: "What type of maintenance is needed (plumbing, electrical, HVAC, janitorial, or structural) and how urgent is it (low, medium, high, or critical)?"
		- After getting details: Provide a direct link to the maintenance request form with all parameters pre-filled
		- Example URL format: https://facilities-ticketing.com/facilities/maintenance-request?location=Building+A+Floor+3&issueType=plumbing&urgency=high

		4. For benefits inquiry:
		- You already have: user's name, component, work location, and office location
		- Only ask for: type of benefit and specific question
		- Example: "Which benefit would you like to inquire about (health insurance, dental insurance, vision insurance, retirement plan, or life insurance) and what's your specific question?"
		- After getting details: Provide a direct link to the benefits inquiry form with all parameters pre-filled
		- Example URL format: https://hr-ticketing.com/hr/benefits-inquiry?benefitType=health_insurance&question=What+is+the+deductible+for+family+coverage`;

export default async (req: HandlerEvent, _context: Context) => {
	try {
		const validation = await validateChatRequest(req);
		if (validation.error) {
			return createResponse(
				{ error: validation.error.message },
				validation.error.status,
				validation.error.headers,
			);
		}

		if (!validation.body) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Invalid request body" }),
			};
		}
		const { message, history, userDetails } = validation.body;

		if (message.toLowerCase() === "update my information") {
			const userInfoResponse = `I'll help you update your information. Here is what I currently have on file for you:
                 Name: ${userDetails.firstName} ${userDetails.lastName}
                 Job Title: ${userDetails.jobTitle}
                 Component: ${userDetails.component}
                 Work Location: ${userDetails.workLocation}
                 Office: ${userDetails.officeLocation}

                 Which field(s) would you like to correct?`;
			return createResponse({ response: userInfoResponse });
		}

		if (!isAiAvailable || !model) {
			return createResponse({
				response:
					"I'm currently in maintenance mode. Please check back later or contact support for immediate assistance.",
				aiDisabled: true,
			});
		}

		const allLinksDescription = await generateLinksDescription();

		const systemMessage = `
				${ASSISTANT_RULES}

				You are an internal support assistant for an enterprise portal, specifically handling requests for IT, HR, and Facilities components.
				Your role is to help employees navigate internal processes and forms through natural conversation.
				You should be professional, efficient, and helpful while maintaining a friendly tone.

				${buildUserContext(userDetails)}

				Available resources:
				${allLinksDescription}

				When helping with requests:
				1. First, identify which website the request belongs to (IT, HR, or Facilities)
				2. Find the appropriate form in the available resources
				3. If parameters are needed, ask ONLY for the ones you don't already have
				4. Once you have all the required parameters, provide a direct link with all parameters pre-filled
				5. If a parameter has no value, DO NOT include it in the URL

				${COMMON_SCENARIOS}`;

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
				...(history || []).map((item: HistoryItem) => ({
					role: item.role,
					parts: item.parts.map((part) => ({ text: part.text })),
				})),
				{
					role: "user",
					parts: [{ text: message }],
				},
			],
		});

		if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
			throw new Error("No valid response from AI model");
		}

		const messageToClient = result.candidates[0].content.parts[0].text;
		return createResponse({ response: messageToClient });
	} catch (error: unknown) {
		return handleAIError(error);
	}
};

export const config = {
	path: "/api/chat",
};
