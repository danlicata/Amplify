import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	HandThumbUpIcon,
	InformationCircleIcon,
	WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import type { FC } from "react";
import React, { useState } from "react";
import Card from "./ui/Card";
import Tooltip from "./ui/Tooltip";

export interface Outage {
	id: string;
	service: string;
	description: string;
	status: "investigating" | "identified" | "monitoring" | "resolved";
	affectedCount: number;
}

interface OutageStatusProps {
	outages: Outage[];
}

const statusConfig = {
	investigating: {
		icon: WrenchScrewdriverIcon,
		color: "text-yellow-500",
		label: "Investigating",
	},
	identified: {
		icon: InformationCircleIcon,
		color: "text-blue-500",
		label: "Identified",
	},
	monitoring: {
		icon: ExclamationTriangleIcon,
		color: "text-orange-500",
		label: "Monitoring",
	},
	resolved: {
		icon: CheckCircleIcon,
		color: "text-green-500",
		label: "Resolved",
	},
};

const OutageStatus: FC<OutageStatusProps> = ({ outages }) => {
	const [affectedOutages, setAffectedOutages] = useState<string[]>([]);
	const [outagesState, setOutagesState] = useState<Outage[]>(outages);

	const handleAffectedClick = (outageId: string) => {
		setAffectedOutages((prev) => [...prev, outageId]);
		setOutagesState((prevOutages) =>
			prevOutages.map((outage) =>
				outage.id === outageId
					? { ...outage, affectedCount: outage.affectedCount + 1 }
					: outage,
			),
		);
		// Here you would typically make an API call to record this information
		console.log(`User is affected by outage ${outageId}`);
	};

	return (
		<Card>
			<h3 className="mb-3 text-2xl font-bold text-slate-800">System Status</h3>
			{outagesState.length === 0 ? (
				<div className="flex items-center">
					<CheckCircleIcon className="mr-2 h-6 w-6 text-green-500" />
					<p className="text-slate-600">All systems are operational.</p>
				</div>
			) : (
				<ul className="space-y-4">
					{outagesState.map((outage) => {
						const config = statusConfig[outage.status];
						const Icon = config.icon;
						return (
							<li key={outage.id} className="flex items-start">
								<Icon
									className={`mr-3 h-6 w-6 flex-shrink-0 ${config.color} mt-1`}
									aria-hidden="true"
								/>
								<div>
									<p className="font-semibold text-slate-800">
										{outage.service}
									</p>
									<p className="text-sm text-slate-600">{outage.description}</p>
									<p className={`text-sm font-medium ${config.color}`}>
										{config.label}
									</p>
									<div className="mt-2">
										<Tooltip
											content={`${outage.affectedCount} clicked in the last hour`}
										>
											<button
												type="button"
												onClick={() => handleAffectedClick(outage.id)}
												disabled={affectedOutages.includes(outage.id)}
												className="mt-2 inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
											>
												<HandThumbUpIcon
													className="-ml-0.5 mr-1.5 h-5 w-5 text-slate-400"
													aria-hidden="true"
												/>
												I'm affected
											</button>
										</Tooltip>
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</Card>
	);
};

export default OutageStatus;
