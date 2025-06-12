import { defineBackend } from "@aws-amplify/backend";
import { Duration, Stack } from "aws-cdk-lib";
import {
	CorsHttpMethod,
	HttpApi,
	HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { chat } from "./functions/chat/resource";
import { hello } from "./functions/hello/resource";
import { smartSearch } from "./functions/smart-search/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */

const backend = defineBackend({
	hello,
	smartSearch,
	chat,
});

// Create a new API stack
const apiStack = backend.createStack("MyApiStack");

// Create the HTTP Lambda integration
const helloIntegration = new HttpLambdaIntegration(
	"HelloIntegration",
	backend.hello.resources.lambda, // Correctly reference the Lambda function resource
);

// Create the HTTP Lambda integration for smartSearch function
const smartSearchIntegration = new HttpLambdaIntegration(
	"SmartSearchIntegration",
	backend.smartSearch.resources.lambda, // Reference the smartSearch Lambda resource
);

// Create the HTTP Lambda integration for chat function
const chatIntegration = new HttpLambdaIntegration(
	"ChatIntegration",
	backend.chat.resources.lambda, // Reference the chat Lambda resource
);

// Create an HTTP API
const httpApi = new HttpApi(apiStack, "MyHttpApi", {
	apiName: "apiGateway",
	corsPreflight: {
		allowHeaders: ["*"],
		allowMethods: [
			CorsHttpMethod.GET,
			CorsHttpMethod.POST,
			CorsHttpMethod.OPTIONS,
			CorsHttpMethod.PUT,
			CorsHttpMethod.DELETE,
			CorsHttpMethod.PATCH,
		],
		allowOrigins: ["*"],
		maxAge: Duration.days(1),
		exposeHeaders: ["*"],
		allowCredentials: false, // Explicitly set to false when using wildcard origin
	},
	createDefaultStage: true,
});

// Add the route to the API
httpApi.addRoutes({
	path: "/api/hello", // Your desired path
	methods: [HttpMethod.GET, HttpMethod.OPTIONS], // HttpMethod is correct here for route methods
	integration: helloIntegration,
});

// Add the /api/smart-search route
httpApi.addRoutes({
	path: "/api/smart-search",
	methods: [HttpMethod.POST, HttpMethod.OPTIONS], // Add OPTIONS method for CORS preflight
	integration: smartSearchIntegration,
});

// Add the /api/chat route
httpApi.addRoutes({
	path: "/api/chat",
	methods: [HttpMethod.POST],
	integration: chatIntegration,
});

// Add outputs to the configuration file for easy access to the API endpoint
backend.addOutput({
	custom: {
		API: {
			[httpApi.httpApiName ?? "apiGateway"]: {
				endpoint: httpApi.url,
				region: Stack.of(httpApi).region,
				apiName: httpApi.httpApiName,
			},
		},
	},
});
