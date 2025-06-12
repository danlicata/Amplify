import React, {
	type FC,
	Fragment,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";

interface Message {
	id: number;
	text: string;
	sender: "user" | "bot";
	aiDisabled?: boolean;
	error?: string;
}

interface ChatHistoryItem {
	role: "user" | "model";
	parts: Array<{ text: string }>;
}

interface ChatResponse {
	response: string;
	aiDisabled?: boolean;
	error?: string;
}

interface UserDetails {
	firstName: string;
	lastName: string;
	jobTitle: string;
	component: string;
	location: string;
}

interface AiBotProps {
	userDetails?: UserDetails;
}

const defaultUserDetails: UserDetails = {
	firstName: "John",
	lastName: "Solly",
	jobTitle: "IT Specialist",
	component: "Front Office",
	location: "Example-1000",
};

// New function to safely render basic Markdown (bold, newlines)
const renderMarkdownContent = (markdownText: string): ReactNode[] => {
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

	// Split text by lines to better handle list items
	const lines = markdownText.split(/\n/);

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const line = lines[lineIndex];
		let lineProcessed = false;

		// Check if this line is an ordered list item (e.g., "1. ", "2. ", etc.)
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

		// Check if this line is an unordered list item (-, *, •)
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

		// If not a list item, process the line normally
		if (!lineProcessed) {
			if (lineIndex > 0) {
				flushText();
				elements.push(<br key={`br-${keyIndex++}`} />);
			}

			// Process the line character by character for inline markdown
			for (let i = 0; i < line.length; i++) {
				// Handle **bold**
				if (line.startsWith("**", i) && line.includes("**", i + 2)) {
					flushText();
					const endIndex = line.indexOf("**", i + 2);
					const boldText = line.substring(i + 2, endIndex);
					elements.push(
						<strong key={`strong-${keyIndex++}`}>{boldText}</strong>,
					);
					i = endIndex + 1; // Move past the closing '**'
				}
				// Regular character
				else {
					currentText += line[i];
				}
			}
		}
	}

	flushText(); // Add any remaining text
	return elements;
};

// Helper function to render inline markdown (bold) within list items
const renderInlineMarkdown = (text: string): ReactNode[] => {
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
		// Handle **bold**
		if (text.startsWith("**", i) && text.includes("**", i + 2)) {
			flushText();
			const endIndex = text.indexOf("**", i + 2);
			const boldText = text.substring(i + 2, endIndex);
			elements.push(
				<strong key={`inline-strong-${keyIndex++}`}>{boldText}</strong>,
			);
			i = endIndex + 1; // Move past the closing '**'
		} else {
			currentText += text[i];
		}
	}

	flushText();
	return elements;
};

const renderMessageWithLinks = (text: string): Array<ReactNode> => {
	const urlRegex = /(https?:\/\/[^\s]+|\/[^\s]+)/g; // Further corrected regex

	// 1. Split the original plain text by URLs
	const parts = text.split(urlRegex);

	return parts
		.map((part, index) => {
			if (!part) return null; // Skip empty parts that can result from split

			// If index is odd, 'part' is a URL
			if (index % 2 === 1) {
				// Remove backticks if they surround the URL or are at the very start/end
				const cleanedPart = part.replace(/^`+|`+$/g, "");
				const isInternal = cleanedPart.startsWith("/");
				return (
					<a
						key={`link-${index}-${cleanedPart}`} // More unique key
						href={cleanedPart}
						target="_blank"
						rel="noopener noreferrer"
						className={`underline ${isInternal ? "text-blue-400" : "text-blue-400"} hover:text-blue-300 break-words`}
					>
						{cleanedPart}
					</a>
				);
			}

			// If index is even, 'part' is a non-URL text segment.
			// Remove any backticks from the text segment first
			const cleanedTextSegment = part.replace(/`/g, ""); // Remove all backticks from text segments
			// Then render basic markdown elements
			return (
				<Fragment
					key={`segment-${index}-${cleanedTextSegment.substring(0, 10)}`}
				>
					{renderMarkdownContent(cleanedTextSegment)}
				</Fragment>
			);
		})
		.filter(Boolean) as Array<ReactNode>; // Filter out nulls from empty parts
};

const AiBot: FC<AiBotProps> = ({ userDetails }) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [currentMessage, setCurrentMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isAiDisabled, setIsAiDisabled] = useState<boolean>(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatHistory = useRef<ChatHistoryItem[]>([]);

	// Check AI status on component mount
	useEffect(() => {
		// Add initial bot message
		const details = userDetails ?? defaultUserDetails;
		const initialBotMessage: Message = {
			id: Date.now(),
			text: `Hello ${details.firstName}! I have the following details for you:\n\n- **Name:** ${details.firstName} ${details.lastName}\n- **Job Title:** ${details.jobTitle}\n- **Department:** ${details.component}\n- **Location:** ${details.location}\n\nIf any of these details are incorrect, please let me know and I'll forward your updates to HR. Otherwise, how can I help you today? You can ask about IT support, HR requests, or Facilities help.`,
			sender: "bot",
		};
		setMessages([initialBotMessage]);
	}, [userDetails]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: messages is intentionally included to scroll on new messages
	useEffect(() => {
		// Scroll to bottom when messages change
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = async () => {
		if (currentMessage.trim() === "") return;

		const userMsgId = Date.now();
		const newUserMessage: Message = {
			id: userMsgId,
			text: currentMessage,
			sender: "user",
		};

		setMessages((prevMessages) => [...prevMessages, newUserMessage]);

		// Add to chat history
		chatHistory.current.push({
			role: "user",
			parts: [{ text: currentMessage }],
		});

		setCurrentMessage("");
		setIsLoading(true);

		try {
			if (isAiDisabled) {
				// Simulate response if AI is disabled
				setTimeout(() => {
					const botResponse: Message = {
						id: Date.now(),
						text: "AI assistance is currently unavailable. Please check back later or contact support for immediate assistance.",
						sender: "bot",
					};
					setMessages((prevMessages) => [...prevMessages, botResponse]);
					setIsLoading(false);
				}, 500);
				return;
			}

			// Test response for demonstrating list rendering
			if (currentMessage.toLowerCase().includes("test list")) {
				setTimeout(() => {
					const botResponse: Message = {
						id: Date.now(),
						text: "Here are the steps to complete your request:\n\n1. First, gather all necessary information\n2. Fill out the required forms\n3. Submit your request through the portal\n\nAdditional items to consider:\n- Check your eligibility\n- Review the **important** deadlines\n- Contact support if needed",
						sender: "bot",
					};
					setMessages((prevMessages) => [...prevMessages, botResponse]);
					setIsLoading(false);
				}, 1000);
				return;
			}

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: currentMessage,
					history: chatHistory.current,
					userDetails: userDetails ?? defaultUserDetails,
				}),
			});

			const data: ChatResponse = await response.json();

			if (data.aiDisabled) {
				setIsAiDisabled(true);
			}

			const botResponse: Message = {
				id: Date.now(),
				text: data.error || data.response,
				sender: "bot",
			};

			setMessages((prevMessages) => [...prevMessages, botResponse]);

			// Add bot response to chat history
			chatHistory.current.push({
				role: "model",
				parts: [{ text: data.response }],
			});
		} catch (error) {
			console.error("Error sending message:", error);
			const errorMsg: Message = {
				id: Date.now(),
				text: "Sorry, there was an error processing your request. Please try again later.",
				sender: "bot",
			};
			setMessages((prevMessages) => [...prevMessages, errorMsg]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-white shadow-xl rounded-lg p-6 flex flex-col h-[500px] w-full max-w-lg">
			<h3 className="text-2xl font-semibold text-slate-700 mb-4">
				AI Assistant
			</h3>
			<div className="flex-grow overflow-y-auto mb-4 p-4 bg-slate-50 rounded-md border border-slate-200 space-y-3">
				{messages.length === 0 ? (
					<div className="text-center text-slate-500 italic">
						Start a conversation to get help with your ticketing needs.
					</div>
				) : (
					messages.map((msg) => (
						<div
							key={msg.id}
							className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
						>
							<span
								className={`px-4 py-2 rounded-lg max-w-[70%] text-sm ${
									msg.sender === "user"
										? "bg-blue-600 text-white rounded-br-none"
										: "bg-slate-200 text-slate-800 rounded-bl-none"
								}`}
							>
								{renderMessageWithLinks(msg.text)}
							</span>
						</div>
					))
				)}
				{isLoading && (
					<div className="flex justify-start">
						<span className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 rounded-bl-none">
							<div className="flex space-x-1">
								<div
									className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
									style={{ animationDelay: "0ms" }}
								/>
								<div
									className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
									style={{ animationDelay: "300ms" }}
								/>
								<div
									className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
									style={{ animationDelay: "600ms" }}
								/>
							</div>
						</span>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
			<div className="flex items-center gap-2">
				<input
					type="text"
					value={currentMessage}
					onChange={(e) => setCurrentMessage(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSendMessage();
						}
					}}
					className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow duration-150 ease-in-out"
					placeholder="Type your message..."
					disabled={isLoading}
				/>
				<button
					type="button"
					onClick={handleSendMessage}
					disabled={isLoading || currentMessage.trim() === ""}
					className={`font-semibold p-3 rounded-lg transition-colors transition-transform duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105 ${
						isLoading || currentMessage.trim() === ""
							? "bg-blue-300 text-white cursor-not-allowed"
							: "bg-blue-600 hover:bg-blue-700 text-white"
					}`}
				>
					Send
				</button>
			</div>
		</div>
	);
};

export default AiBot;
