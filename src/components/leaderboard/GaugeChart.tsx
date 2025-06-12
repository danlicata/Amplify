import { GaugeChart as EChartsGaugeChart } from "echarts/charts";
import type { EChartsCoreOption } from "echarts/core";
import { init, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import React, { useEffect, useRef } from "react";

// Register the necessary components
use([EChartsGaugeChart, CanvasRenderer]);

interface GaugeChartProps {
	taskName: string;
	completed: number;
	total: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
	taskName,
	completed,
	total,
}) => {
	const chartRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (chartRef.current) {
			// const chart = echarts.init(chartRef.current);
			const chart = init(chartRef.current);
			const percentage = total === 0 ? 0 : (completed / total) * 100;
			let statusColor = "";
			if (percentage <= 33) {
				statusColor = "#dc2626"; // red
			} else if (percentage >= 34 && percentage <= 66) {
				statusColor = "#facc15"; // yellow
			} else if (percentage > 66) {
				statusColor = "#22c55e"; // green
			}

			const unfilledTrackColor = "#e5e7eb"; // Always use grey for the unfilled part of the track

			// const option: echarts.EChartsOption = {
			// const option: EChartsOption = {
			const option: EChartsCoreOption = {
				series: [
					{
						type: "gauge",
						center: ["50%", "80%"], // Position origin at bottom-center
						radius: "125%", // Radius fills height (making arc height equal to div height)
						startAngle: 180,
						endAngle: 0,
						min: 0,
						max: total,
						splitNumber: 10,
						axisLine: {
							lineStyle: {
								width: 20,
								color: [[1, unfilledTrackColor]], // Use array format for color
							},
						},
						pointer: {
							show: false,
						},
						axisTick: {
							show: false,
						},
						splitLine: {
							show: false,
						},
						axisLabel: {
							show: false,
						},
						detail: {
							show: false, // We'll display this separately
						},
						data: [
							{
								value: completed,
								name: taskName,
							},
						],
						title: {
							show: false,
						},
						anchor: {
							show: false,
						},
						progress: {
							show: true,
							width: 20,
							roundCap: true,
							itemStyle: {
								color: statusColor,
							},
						},
					},
				],
			};
			// chart.setOption(option);
			chart.setOption(option);

			return () => {
				chart.dispose();
			};
		}
	}, [taskName, completed, total]);

	return (
		<div className="flex flex-col items-center">
			{/* Set height to 96px to match checkmark, add mb-2 for consistent spacing */}
			<div
				ref={chartRef}
				style={{ width: "200px", height: "96px" }}
				className="mb-2"
			/>
			<div className="text-base font-medium text-slate-700">{taskName}</div>
			<div className="text-sm text-slate-500">{`${completed}/${total}`}</div>
		</div>
	);
};

export default GaugeChart;
