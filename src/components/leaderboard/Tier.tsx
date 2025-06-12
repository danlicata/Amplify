import { CheckCircleIcon } from "@heroicons/react/24/solid";
import React from "react";
import GaugeChart from "./GaugeChart";

interface TaskData {
	taskName: string;
	completed: number;
	total: number;
}

interface TierProps {
	tierName: React.ReactNode;
	hasCentralizedReporting: boolean;
	tasks: TaskData[];
}

const getBadgeClasses = (hasReporting: boolean): string => {
	if (hasReporting) {
		return "bg-green-100 text-green-700 ring-green-600/20";
	} else {
		return "bg-red-100 text-red-700 ring-red-600/20";
	}
};

const reportingStatusTextMap: Record<string, string> = {
	true: "Centralized Reporting: Yes",
	false: "Centralized Reporting: No",
};

const ReportingBadge: React.FC<{ hasReporting: boolean }> = ({
	hasReporting,
}) => {
	const statusText = reportingStatusTextMap[String(hasReporting)];
	return (
		<span
			className={`absolute top-2 left-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getBadgeClasses(hasReporting)}`}
		>
			{statusText}
		</span>
	);
};

const Tier: React.FC<TierProps> = ({
	tierName,
	hasCentralizedReporting,
	tasks,
}) => {
	const totalTasks = tasks.reduce((sum, task) => sum + task.total, 0);
	const completedTasks = tasks.reduce((sum, task) => sum + task.completed, 0);
	const overallProgress =
		totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

	return (
		<div className="relative mb-8 p-4 bg-white shadow-sm rounded-xl pt-10 border border-slate-200">
			<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<GaugeChart progress={overallProgress} />
			</div>
			<ReportingBadge hasReporting={hasCentralizedReporting} />
			<h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">
				{tierName}
			</h2>
			<div className="flex flex-col md:flex-row justify-evenly items-start">
				{tasks.map((task) => (
					<div
						key={task.taskName}
						className="w-full md:w-1/3 p-2 flex flex-col items-center text-center"
					>
						{task.completed === task.total ? (
							<>
								<CheckCircleIcon className="h-16 w-16 text-green-500 mb-2" />
								<p className="text-base font-medium text-slate-700">
									{task.taskName}
								</p>
								<p className="text-sm text-slate-500">Completed</p>
							</>
						) : (
							<GaugeChart
								taskName={task.taskName}
								completed={task.completed}
								total={task.total}
							/>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default Tier;
