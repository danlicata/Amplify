import React from "react";
import Legend from "./Legend";
import Tier from "./Tier";

interface TierData {
	tierName: string;
	hasCentralizedReporting: boolean;
	tasks: Array<{ taskName: string; completed: number; total: number }>;
}

const leaderboardData: TierData[] = [
	{
		tierName: "Security Ticketing",
		hasCentralizedReporting: true,
		tasks: [
			{ taskName: "Level 1", completed: 180, total: 200 },
			{ taskName: "Level 2", completed: 60, total: 150 },
			{ taskName: "Level 3", completed: 10, total: 100 },
		],
	},
	{
		tierName: "Facilities Ticketing",
		hasCentralizedReporting: true,
		tasks: [
			{ taskName: "Level 1", completed: 120, total: 120 },
			{ taskName: "Level 2", completed: 45, total: 90 },
			{ taskName: "Level 3", completed: 0, total: 60 },
		],
	},
	{
		tierName: "HR Ticketing",
		hasCentralizedReporting: false,
		tasks: [
			{ taskName: "Level 1", completed: 90, total: 180 },
			{ taskName: "Level 2", completed: 30, total: 120 },
			{ taskName: "Level 3", completed: 15, total: 80 },
		],
	},
	{
		tierName: "Purchasing Ticketing",
		hasCentralizedReporting: true,
		tasks: [
			{ taskName: "Level 1", completed: 250, total: 250 },
			{ taskName: "Level 2", completed: 100, total: 200 },
			{ taskName: "Level 3", completed: 20, total: 150 },
		],
	},
];

const Leaderboard: React.FC = () => {
	return (
		<div className="w-full max-w-2xl mx-auto">
			<h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">
				Enterprise Ticketing Portal - Integration Progress
			</h1>
			<Legend />
			{leaderboardData.map((tier) => (
				<Tier
					key={tier.tierName}
					tierName={tier.tierName}
					hasCentralizedReporting={tier.hasCentralizedReporting}
					tasks={tier.tasks}
				/>
			))}
		</div>
	);
};

export default Leaderboard;
