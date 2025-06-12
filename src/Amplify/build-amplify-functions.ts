import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const amplifyTypesContent = `// Common types for Amplify (AWS Lambda)
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

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
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...additionalHeaders,
    },
    body: JSON.stringify(body),
  };
}

// Helper function to get environment variables
export function getEnv(key: string): string | undefined {
  return process.env[key];
}

// Helper function to parse request body
export async function parseBody(
  event: APIGatewayProxyEvent,
): Promise<unknown> {
  return event.body ? JSON.parse(event.body) : null;
}

// Helper function to get HTTP method
export function getMethod(event: APIGatewayProxyEvent): string {
  return event.httpMethod;
}
`;

// Function to transform Netlify function code to Amplify format
function transformNetlifyToAmplify(code: string): string {
  // Replace Netlify imports with AWS Lambda types
  let transformed = code
    .replace(
      /import type { Context } from "@netlify\/functions";/g,
      'import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";'
    )
    // Replace Netlify environment variable access
    .replace(/Netlify\.env\.get\(/g, 'process.env.')
    // Replace default export with named handler
    .replace(
      /export default async \(req: Request, _context: Context\) => {/g,
      'export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {'
    )
    // Replace Request object access with event object
    .replace(/req\.method/g, 'event.httpMethod')
    .replace(/await req\.text\(\)/g, 'event.body')
    // Replace Response object with Amplify response format
    .replace(
      /return new Response\(([^,]+),\s*{([^}]+)}\)/g,
      (_, body, headers) => {
        const headerObj = headers
          .split(',')
          .map((h: string) => h.trim())
          .reduce((acc: Record<string, string>, h: string) => {
            const [key, value] = h.split(':').map((s) => s.trim());
            if (key && value) {
              acc[key.replace(/['"]/g, '')] = value.replace(/['"]/g, '');
            }
            return acc;
          }, {});

        return `return {
          statusCode: ${body.includes('error') ? '400' : '200'},
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            ...${JSON.stringify(headerObj)}
          },
          body: ${body}
        }`;
      }
    );

  // Replace all instances of 'req' with 'event'
  transformed = transformed.replace(/req\b/g, 'event');

  // Replace all instances of 'Response' (constructor) with nothing (handled above)
  transformed = transformed.replace(/new Response/g, '');

  return transformed;
}

// Function to process a single Netlify function
function processNetlifyFunction(functionName: string) {
  const netlifyFunctionPath = join(rootDir, 'netlify', 'functions', `${functionName}.mts`);
  const amplifyFunctionDir = join(rootDir, 'amplify', 'functions', functionName);
  const amplifyFunctionPath = join(amplifyFunctionDir, 'index.ts');
  const functionTypesPath = join(amplifyFunctionDir, 'types.ts');

  try {
    // Create the Amplify function directory if it doesn't exist
    if (!existsSync(amplifyFunctionDir)) {
      mkdirSync(amplifyFunctionDir, { recursive: true });
    }

    // Read and transform the Netlify function
    const netlifyCode = readFileSync(netlifyFunctionPath, 'utf-8');
    const amplifyCode = transformNetlifyToAmplify(netlifyCode);
    writeFileSync(amplifyFunctionPath, amplifyCode);

    // Write Amplify-compatible types.ts to the function directory
    writeFileSync(functionTypesPath, amplifyTypesContent);

    console.log(`✅ Successfully transformed ${functionName} function`);
  } catch (error) {
    console.error(`❌ Error processing ${functionName} function:`, error);
  }
}

// Main function to process all Netlify functions
async function buildAmplifyFunctions() {
  console.log('🚀 Starting Netlify to Amplify function transformation...');

  // List of functions to process
  const functions = ['smart-search', 'chat'];

  for (const functionName of functions) {
    processNetlifyFunction(functionName);
  }

  console.log('✨ Amplify functions build complete!');

  // Run formatter
  try {
    console.log('🧹 Running formatter...');
    execSync('npm run check:biome:fix', { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Formatter failed.');
    process.exit(1);
  }

  // Run validation
  try {
    console.log('🔎 Running validation...');
    execSync('npm run validate', { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Validation failed.');
    process.exit(1);
  }
}

// Run the build
buildAmplifyFunctions().catch((err) => {
  console.error(err);
  process.exit(1);
}); 