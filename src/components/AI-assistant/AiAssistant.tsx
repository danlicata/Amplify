import { XMarkIcon } from "@heroicons/react/24/solid";
import React, {
	type FC,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import UserAvatar from "../UserAvatar";
import Card from "../ui/Card";
import AiAssistantEmptyState from "./AiAssistantEmptyState";
import AiAvatar from "./AiAvatar";

// Helper utilities for rendering markdown & links
import { renderMessageWithLinks } from "./ai-assistant-helper-funcs";

interface Message {
	id: number;
	text: string;
	sender: "user" | "assistant";
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
	workLocation: string;
	officeLocation: string;
}

interface AiAssistantProps {
	userDetails?: UserDetails;
}

const defaultUserDetails: UserDetails = {
	firstName: "John",
	lastName: "Solly",
	jobTitle: "IT Specialist",
	component: "Front Office",
	workLocation: "HQ",
	officeLocation: "Building A, Floor 3, Room 301",
};

const AiAssistant: FC<AiAssistantProps> = ({ userDetails }) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [currentMessage, setCurrentMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isAiDisabled, setIsAiDisabled] = useState<boolean>(false);
	const [isAssistantFocused, setIsAssistantFocused] = useState<boolean>(false);
	// Reference to the scrollable chat container
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const chatHistory = useRef<ChatHistoryItem[]>([]);

	// Focus the input after the user has interacted (i.e., there is at least one message).
	// Avoid focusing on initial mount to prevent the page from auto-scrolling down.
	useEffect(() => {
		if (!isLoading && messages.length > 0) {
			inputRef.current?.focus();
		}
	}, [isLoading, messages.length]);

	const clearChat = () => {
		setMessages([]);
		setCurrentMessage("");
		chatHistory.current = [];
		setIsAiDisabled(false);
		// Refocus the input after clearing chat
		inputRef.current?.focus();
	};

	// Effect to handle auto-scrolling the chat container
	useEffect(() => {
		const container = chatContainerRef.current;
		if (!container || messages.length === 0) return;

		const lastMessage = messages[messages.length - 1];
		const NEAR_BOTTOM_THRESHOLD = 80; // px
		const distanceFromBottom =
			container.scrollHeight - container.scrollTop - container.clientHeight;
		const isNearBottom = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;

		if (lastMessage.sender === "user" || isNearBottom) {
			container.scrollTo({
				top: container.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [messages]);

	// Effect to set up the global event listener for starting a chat
	useEffect(() => {
		const handleStartChatEvent = (event: Event) => {
			const customEvent = event as CustomEvent<{ message: string }>;
			if (customEvent.detail.message) {
				handleSendMessage(customEvent.detail.message);
			}
		};

		document.addEventListener("start-ai-chat", handleStartChatEvent);

		return () => {
			document.removeEventListener("start-ai-chat", handleStartChatEvent);
		};
	}, []); // Empty dependency array ensures this runs only once

	// Only enable the centred modal experience on screens that are at least
	// Tailwind's `sm` breakpoint (640 px). On smaller viewports we keep the
	// assistant inline so the mobile keyboard doesn't cause layout issues.
	const handleFocus = useCallback(() => {
		if (typeof window !== "undefined" && window.innerWidth >= 640) {
			setIsAssistantFocused(true);
		}
	}, []);

	const handleCloseFocus = useCallback(() => {
		setIsAssistantFocused(false);
	}, []);

	// Close on Escape key when focused
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				handleCloseFocus();
			}
		};

		if (isAssistantFocused) {
			document.addEventListener("keydown", handleKeyDown);
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isAssistantFocused, handleCloseFocus]);

	const handleSendMessage = async (message?: string) => {
		const messageToSend = message || currentMessage;
		if (messageToSend.trim() === "") return;

		const userMsgId = Date.now();
		const newUserMessage: Message = {
			id: userMsgId,
			text: messageToSend,
			sender: "user",
		};

		setMessages((prevMessages) => [...prevMessages, newUserMessage]);

		// Add to chat history
		chatHistory.current.push({
			role: "user",
			parts: [{ text: messageToSend }],
		});

		if (!message) {
			setCurrentMessage("");
		}
		setIsLoading(true);

		try {
			if (isAiDisabled) {
				// Simulate response if AI is disabled
				setTimeout(() => {
					const assistantResponse: Message = {
						id: Date.now(),
						text: "AI assistance is currently unavailable. Please check back later or contact support for immediate assistance.",
						sender: "assistant",
					};
					setMessages((prevMessages) => [...prevMessages, assistantResponse]);
					setIsLoading(false);
				}, 500);
				return;
			}

			// Test response for demonstrating list rendering
			if (messageToSend.toLowerCase().includes("test list")) {
				setTimeout(() => {
					const assistantResponse: Message = {
						id: Date.now(),
						text: "Here are the steps to complete your request:\n\n1. First, gather all necessary information\n2. Fill out the required forms\n3. Submit your request through the portal\n\nAdditional items to consider:\n- Check your eligibility\n- Review the **important** deadlines\n- Contact support if needed",
						sender: "assistant",
					};
					setMessages((prevMessages) => [...prevMessages, assistantResponse]);
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
					message: messageToSend,
					history: chatHistory.current,
					userDetails: userDetails ?? defaultUserDetails,
				}),
			});

			const data: ChatResponse = await response.json();

			if (data.aiDisabled) {
				setIsAiDisabled(true);
			}

			const assistantResponse: Message = {
				id: Date.now(),
				text: data.error || data.response,
				sender: "assistant",
			};

			setMessages((prevMessages) => [...prevMessages, assistantResponse]);

			// Add assistant response to chat history
			chatHistory.current.push({
				role: "model",
				parts: [{ text: data.response }],
			});
		} catch (error) {
			console.error("Error sending message:", error);
			const errorMsg: Message = {
				id: Date.now(),
				text: "Sorry, there was an error processing your request. Please try again later.",
				sender: "assistant",
			};
			setMessages((prevMessages) => [...prevMessages, errorMsg]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleExampleClick = (text: string) => {
		handleSendMessage(text);
	};

	return (
		<div>
			{isAssistantFocused && (
				<div
					className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out"
					onClick={handleCloseFocus}
					aria-hidden="true"
				/>
			)}
			<div
				className={`transition-all duration-300 ease-in-out ${isAssistantFocused ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-3xl" : "relative"}`}
			>
				<Card
					className="flex flex-col max-h-[calc(100vh_-_9rem)] w-full"
					ref={chatContainerRef}
				>
					<div className="flex justify-between items-center mb-4">
						<div>
							<h3 className="text-2xl font-bold text-slate-800">
								AI Assistant
							</h3>
							<p className="text-sm text-slate-500 mt-1">
								Your personal guide for internal support requests
							</p>
						</div>
						{messages.length > 0 && (
							<button
								type="button"
								onClick={clearChat}
								className="text-sm text-slate-500 hover:text-slate-700 transition-colors duration-150 flex items-center gap-1 cursor-pointer"
								aria-label="Clear chat history"
							>
								<XMarkIcon className="h-4 w-4" aria-hidden="true" />
								Clear Chat
							</button>
						)}
					</div>
					<div className="flex-grow overflow-y-auto mb-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg space-y-4 min-h-[200px]">
						{messages.length === 0 && !isLoading ? (
							<AiAssistantEmptyState onExampleClick={handleExampleClick} />
						) : (
							messages.map((msg) => (
								<div
									key={msg.id}
									className={`flex w-full ${
										msg.sender === "user" ? "justify-end" : "justify-start"
									} items-center gap-2`}
								>
									{/* Assistant message: avatar on the left */}
									{msg.sender === "assistant" && (
										<AiAvatar
											isThinking={false}
											className="group flex-shrink-0 self-start"
										/>
									)}
									<span
										className={`px-4 py-2.5 rounded-lg max-w-4xl text-sm shadow-sm ${
											msg.sender === "user"
												? "bg-blue-500 text-white"
												: "bg-white text-gray-900"
										}`}
									>
										{renderMessageWithLinks(msg.text)}
									</span>
									{/* User message: avatar on the right */}
									{msg.sender === "user" && (
										<UserAvatar className="order-2 bg-blue-500 text-white border-blue-500" />
									)}
								</div>
							))
						)}
						{isLoading && (
							<output
								className="flex justify-start items-end gap-2"
								aria-label="Assistant is typing"
							>
								<AiAvatar isThinking={true} className="group" />
								<span className="px-4 py-2.5 rounded-lg bg-white text-slate-800 rounded-bl-none shadow-sm border border-slate-100">
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
							</output>
						)}
					</div>
					<div className="flex items-center gap-2">
						<textarea
							ref={inputRef}
							value={currentMessage}
							onChange={(e) => setCurrentMessage(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSendMessage();
								}
							}}
							onFocus={handleFocus}
							className="flex-grow py-2.5 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-150 ease-in-out bg-slate-50 resize-none min-h-[42px] max-h-[120px] overflow-y-auto"
							placeholder="Type your message..."
							aria-label="Chat message input"
							disabled={isLoading}
							rows={1}
							style={{
								height: "auto",
								overflow: "hidden",
							}}
							onInput={(e) => {
								const target = e.target as HTMLTextAreaElement;
								target.style.height = "auto";
								target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
							}}
						/>
						<button
							type="button"
							onClick={() => handleSendMessage()}
							disabled={isLoading || currentMessage.trim() === ""}
							aria-label="Send message"
							className={`font-semibold py-2.5 px-5 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:-translate-y-0.5 ${
								isLoading || currentMessage.trim() === ""
									? "bg-blue-300 text-white cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white"
							}`}
						>
							Send
						</button>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default AiAssistant;
