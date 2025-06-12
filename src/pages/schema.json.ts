import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	try {
		const filePath = join(process.cwd(), "data", "schema.json");
		const fileContents = readFileSync(filePath, "utf-8");
		const data = JSON.parse(fileContents);

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=3600", // Cache for 1 hour
			},
		});
	} catch (_error) {
		return new Response(
			JSON.stringify({ error: "Failed to load schema data" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
};
