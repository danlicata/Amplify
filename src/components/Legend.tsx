import React from "react";

interface LegendItemProps {
	level: string;
	description: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ level, description }) => (
	<div className="flex items-center space-x-2">
		<span className="font-semibold text-sm text-slate-700">{level}:</span>
		<span className="text-sm text-slate-600">{description}</span>
	</div>
);

const Legend: React.FC = () => {
	const legendData = [
		{ level: "Level 1", description: "Link Generation" },
		{ level: "Level 2", description: "Form Pre-fill via URL Parameters" },
		{
			level: "Level 3",
			description: "Direct Submission (Headless Interaction)",
		},
	];

	const reportingLegendData = [
		{
			status: "Centralized Reporting: Yes",
			description: "Integration reports data back to ServiceNow.",
			className: "bg-green-100 text-green-700 ring-green-600/20",
		},
		{
			status: "Centralized Reporting: No",
			description: "Integration does not report data back to ServiceNow.",
			className: "bg-red-100 text-red-700 ring-red-600/20",
		},
	];

	return (
		<div className="my-6 p-4 bg-white shadow-md rounded-lg">
			<h3 className="text-md font-semibold text-slate-800 mb-3 text-center border-b pb-2">
				Legend
			</h3>
			<div className="space-y-2 mb-4">
				<h4 className="text-sm font-semibold text-slate-700">
					Centralized Reporting Status:
				</h4>
				{reportingLegendData.map((item) => (
					<div key={item.status} className="flex items-center space-x-2">
						<span
							className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${item.className}`}
						>
							{item.status}
						</span>
						<span className="text-sm text-slate-600">{item.description}</span>
					</div>
				))}
			</div>
			<div className="space-y-2 border-t pt-4">
				<h4 className="text-sm font-semibold text-slate-700 mt-3">
					Integration Levels:
				</h4>
				{legendData.map((item) => (
					<LegendItem
						key={item.level}
						level={item.level}
						description={item.description}
					/>
				))}
			</div>
		</div>
	);
};

export default Legend;
