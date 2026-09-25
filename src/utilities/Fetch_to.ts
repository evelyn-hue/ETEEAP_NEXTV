export default async function Fetch_to(
	dir: string,
	payload: Record<string, unknown> = {},
	headers: Record<string, string> = {},
	retries: number = 3,      // number of attempts
	delay: number = 1000      // wait time between attempts in ms
	) {
	if (!dir || dir === "") {
		console.error("Fetch_to: Invalid API Directory");
		return { success: false, message: "Invalid API Directory" };
	}

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			// attach server-side API key when available, but avoid leaking undefined values to the client
			const effectiveHeaders: Record<string, string> = { "Content-Type": "application/json", ...headers };
			if (!effectiveHeaders["x-api-key"] && typeof process !== "undefined" && process.env && process.env.API_KEY) {
				effectiveHeaders["x-api-key"] = process.env.API_KEY as string;
			}

			const fetchOptions: RequestInit = {
				method: "POST",
				headers: effectiveHeaders,
				body: JSON.stringify(payload),
			};

			// when running in the browser, include credentials so cookies (like token) are sent
			if (typeof window !== "undefined") {
				fetchOptions.credentials = 'include';
			}

			const response = await fetch(dir, fetchOptions);

			const data = await response.json().catch(() => null); // safe parse

			if (response.ok) {
				return { success: true, data }; // success
			} else {
				return { success: false, message: data?.error || data?.message || `Request failed: ${response.status}` };
			}
		} catch (err: unknown) {
			let message = "Unknown fetch error";
			if (err instanceof Error) message = err.message;
			console.error(`Attempt ${attempt} fetch error:`, message);
		}

		if (attempt < retries) await new Promise(res => setTimeout(res, delay));
	}
	console.error("Fetch_to: Network connection failed after retries for", dir);
	return { success: false, message: "Unable to connect to the server. Please check your internet connection." };
}
