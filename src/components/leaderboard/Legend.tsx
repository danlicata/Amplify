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

	const legendItems = [{ color: "bg-red-400", label: "Behind Schedule" }];

	return (
		<div className="my-6 p-4 bg-white shadow-sm rounded-xl border border-slate-200">
			<h3 className="text-lg font-semibold text-slate-800 mb-4">Legend</h3>
			<div className="space-y-4">
				<div>
					<h4 className="font-semibold text-slate-700 mb-2">
						Integration Levels
					</h4>
					<div className="space-y-1">
						{legendData.map((item) => (
							<LegendItem
								key={item.level}
								level={item.level}
								description={item.description}
							/>
						))}
					</div>
				</div>
				<div>
					<h4 className="font-semibold text-slate-700 mt-4 mb-2">
						Reporting Status
					</h4>
					<div className="space-y-2">
						{reportingLegendData.map((item) => (
							<div key={item.status} className="flex items-start space-x-2">
								<span
									className={`mt-1 h-4 w-4 flex-shrink-0 rounded-full ${item.className} border border-slate-300`}
								/>
								<div>
									<span className="font-semibold text-sm text-slate-700">
										{item.status}:
									</span>
									<span className="text-sm text-slate-600 ml-1">
										{item.description}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
				<div>
					<h4 className="font-semibold text-slate-700 mt-4 mb-2">
						Timeline Status
					</h4>
					<div className="space-y-2">
						{legendItems.map((item) => (
							<div key={item.label} className="flex items-center">
								<span
									className={`h-4 w-4 rounded-full ${item.color} mr-2 border border-slate-300`}
								/>
								<span className="text-sm text-slate-600">{item.label}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Legend;
