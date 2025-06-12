// Common types for both Netlify and Amplify
declare global {
	interface Netlify {
		env: {
			get(key: string): string | undefined;
		};
	}
}

export interface ApiResponse {
	statusCode: number;
	headers: Record<string, string>;
	body: string;
}

// Helper function to create a response
export function createResponse(
	body: unknown,
	statusCode = 200,
	additionalHeaders: Record<string, string> = {},
): Response {
	return new Response(JSON.stringify(body), {
		status: statusCode,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "Content-Type",
			"Access-Control-Allow-Methods": "POST,OPTIONS",
			...additionalHeaders,
		},
	});
}

// Helper function to get environment variables
export function getEnv(key: string): string | undefined {
	// @ts-ignore - This will be transformed by the build script
	return typeof globalThis.Netlify !== "undefined"
		? globalThis.Netlify.env.get(key)
		: process.env[key];
}

// Helper function to parse request body
export async function parseBody(
	request: Request | { body: string | null },
): Promise<unknown> {
	if ("text" in request) {
		const text = await request.text();
		return text ? JSON.parse(text) : null;
	}
	return request.body ? JSON.parse(request.body) : null;
}

// Helper function to get HTTP method
export function getMethod(request: Request | { httpMethod: string }): string {
	return "method" in request ? request.method : request.httpMethod;
}
