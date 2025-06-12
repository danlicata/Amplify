import React, { Fragment, type ReactNode } from "react";

// Safely render basic Markdown (bold, newlines) into React nodes
export const renderMarkdownContent = (markdownText: string): ReactNode[] => {
	const elements: ReactNode[] = [];
	let currentText = "";
	let keyIndex = 0;

	const flushText = () => {
		if (currentText) {
			elements.push(
				<Fragment key={`text-${keyIndex++}`}>{currentText}</Fragment>,
			);
			currentText = "";
		}
	};

	const lines = markdownText.split(/\n/);

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const line = lines[lineIndex];
		let lineProcessed = false;

		// Ordered list (e.g., "1. Item")
		const orderedListMatch = line.match(/^(\d+)\.\s+(.*)$/);
		if (orderedListMatch) {
			flushText();
			if (lineIndex > 0) {
				elements.push(<br key={`br-list-${keyIndex++}`} />);
			}
			elements.push(
				<span key={`ol-${keyIndex++}`}>
					{orderedListMatch[1]}. {renderInlineMarkdown(orderedListMatch[2])}
				</span>,
			);
			lineProcessed = true;
		}

		// Unordered list (e.g., "- Item" or "* Item")
		const unorderedListMatch = line.match(/^[-*•]\s+(.*)$/);
		if (!lineProcessed && unorderedListMatch) {
			flushText();
			if (lineIndex > 0) {
				elements.push(<br key={`br-list-${keyIndex++}`} />);
			}
			elements.push(
				<span key={`ul-${keyIndex++}`}>
					• {renderInlineMarkdown(unorderedListMatch[1])}
				</span>,
			);
			lineProcessed = true;
		}

		// Plain line processing
		if (!lineProcessed) {
			if (lineIndex > 0) {
				flushText();
				elements.push(<br key={`br-${keyIndex++}`} />);
			}

			for (let i = 0; i < line.length; i++) {
				// Bold **text**
				if (line.startsWith("**", i) && line.includes("**", i + 2)) {
					flushText();
					const endIndex = line.indexOf("**", i + 2);
					const boldText = line.substring(i + 2, endIndex);
					elements.push(
						<strong key={`strong-${keyIndex++}`}>{boldText}</strong>,
					);
					i = endIndex + 1; // Skip past **
				} else {
					currentText += line[i];
				}
			}
		}
	}

	flushText();
	return elements;
};

// Helper to render inline markdown (bold) within list items or inline text
export const renderInlineMarkdown = (text: string): ReactNode[] => {
	const elements: ReactNode[] = [];
	let currentText = "";
	let keyIndex = 0;

	const flushText = () => {
		if (currentText) {
			elements.push(currentText);
			currentText = "";
		}
	};

	for (let i = 0; i < text.length; i++) {
		if (text.startsWith("**", i) && text.includes("**", i + 2)) {
			flushText();
			const endIndex = text.indexOf("**", i + 2);
			const boldText = text.substring(i + 2, endIndex);
			elements.push(
				<strong key={`inline-strong-${keyIndex++}`}>{boldText}</strong>,
			);
			i = endIndex + 1;
		} else {
			currentText += text[i];
		}
	}

	flushText();
	return elements;
};

// Convert plain text with URLs & simple markdown into React nodes
export const renderMessageWithLinks = (text: string): Array<ReactNode> => {
	const urlRegex = /(https?:\/\/[^\s]+|\/[^\s]+)/g;
	const parts = text.split(urlRegex);

	return parts
		.map((part, index) => {
			if (!part) return null;

			// URL parts (odd indices)
			if (index % 2 === 1) {
				const cleanedPart = part.replace(/^`+|`+$/g, "");
				const _isInternal = cleanedPart.startsWith("/");
				return (
					<a
						key={`link-${index}-${cleanedPart}`}
						href={cleanedPart}
						target="_blank"
						rel="noopener noreferrer"
						className={`underline text-blue-400 hover:text-blue-300 break-words`}
					>
						{cleanedPart}
					</a>
				);
			}

			// Non-URL segment – render markdown
			const cleanedTextSegment = part.replace(/`/g, "");
			return (
				<Fragment
					key={`segment-${index}-${cleanedTextSegment.substring(0, 10)}`}
				>
					{renderMarkdownContent(cleanedTextSegment)}
				</Fragment>
			);
		})
		.filter(Boolean) as Array<ReactNode>;
};
