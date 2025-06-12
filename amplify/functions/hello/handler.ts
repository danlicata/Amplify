import type { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event) => {
	console.log("Received event:", JSON.stringify(event, null, 2));

	// Data to return in the response
	const responseData = {
		message: "Hello from your Amplify Function!",
		timestamp: new Date().toISOString(),
	};

	const response = {
		statusCode: 200,
		// Add CORS headers if your frontend is on a different port during local development
		// or a different domain in production.
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*", // Restrict this in production
			"Access-Control-Allow-Headers": "Content-Type",
			"Access-Control-Allow-Methods": "GET,OPTIONS",
		},
		body: JSON.stringify(responseData),
	};

	return response;
};
