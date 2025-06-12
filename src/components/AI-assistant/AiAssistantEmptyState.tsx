import {
	BuildingOffice2Icon,
	ComputerDesktopIcon,
	UsersIcon,
} from "@heroicons/react/24/outline";
import React, { type FC } from "react";

interface ActionCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	onClick: () => void;
	iconClassName?: string;
}

const ActionCard: FC<ActionCardProps> = ({
	icon,
	title,
	description,
	onClick,
	iconClassName = "text-blue-600",
}) => (
	<button
		type="button"
		onClick={onClick}
		aria-label={`${title}: ${description}`}
		className="flex items-start gap-4 p-4 rounded-lg bg-white hover:bg-slate-200 transition-colors duration-150 ease-in-out border border-slate-200 hover:border-slate-300 w-full text-left cursor-pointer"
	>
		<div className={`flex-shrink-0 ${iconClassName}`}>{icon}</div>
		<div className="flex-grow">
			<h4 className="font-semibold text-slate-800">{title}</h4>
			<p className="text-sm text-slate-500">{description}</p>
		</div>
	</button>
);

interface AiAssistantEmptyStateProps {
	onExampleClick: (text: string) => void;
}

const AiAssistantEmptyState: FC<AiAssistantEmptyStateProps> = ({
	onExampleClick,
}) => {
	const examples = [
		{
			icon: <BuildingOffice2Icon className="w-8 h-8" aria-hidden="true" />,
			title: "Facilities",
			description:
				"Get help with building maintenance, repairs, and workspace needs.",
			query: "I need help with a facilities request",
			color: "text-blue-500",
		},
		{
			icon: <UsersIcon className="w-8 h-8" aria-hidden="true" />,
			title: "Human Resources",
			description:
				"Get help with HR policies, benefits, and employee services.",
			query: "I need help with an HR request",
			color: "text-purple-500",
		},
		{
			icon: <ComputerDesktopIcon className="w-8 h-8" aria-hidden="true" />,
			title: "IT Support",
			description:
				"Get assistance with technology, software, and hardware issues.",
			query: "I need help with an IT request",
			color: "text-green-500",
		},
	];

	return (
		<div className="flex flex-col items-center justify-center h-full p-4 animate-fade-in-up">
			<div className="text-center mb-6">
				<h3 className="text-lg font-semibold text-slate-800">
					How can I help you today?
				</h3>
				<p className="text-slate-500 mt-1">
					Select a component or type your request.
				</p>
			</div>
			<div className="w-full max-w-md space-y-4">
				{examples.map((ex) => (
					<ActionCard
						key={ex.title}
						icon={ex.icon}
						title={ex.title}
						description={ex.description}
						onClick={() => onExampleClick(ex.query)}
						iconClassName={ex.color}
					/>
				))}
			</div>
			<div className="mt-8 text-center">
				<p className="text-sm text-slate-500">
					Or start a new request by typing in the box below
				</p>
			</div>
		</div>
	);
};

export default AiAssistantEmptyState;
