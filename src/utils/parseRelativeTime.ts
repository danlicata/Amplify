// Helper function to parse relative time strings into a comparable number (timestamp in milliseconds)
export const parseRelativeTime = (timeString: string): number => {
	const now = Date.now();

	if (timeString === "Yesterday") {
		return now - 24 * 60 * 60 * 1000;
	}

	const parts = timeString.split(" ");
	if (parts.length < 2) {
		return now;
	}

	const value = Number.parseInt(parts[0], 10);
	if (Number.isNaN(value)) {
		return now;
	}

	const unit = parts[1].toLowerCase();

	switch (unit) {
		case "minute":
		case "minutes":
			return now - value * 60 * 1000;
		case "hour":
		case "hours":
			return now - value * 60 * 60 * 1000;
		case "day":
		case "days":
			return now - value * 24 * 60 * 60 * 1000;
		case "week":
		case "weeks":
			return now - value * 7 * 24 * 60 * 60 * 1000;
		default:
			return now;
	}
};
