import React, { memo } from "react";

interface PaginationControlsProps {
	visibleItemsCount: number;
	setVisibleItemsCount: (count: number) => void;
	totalItemsCount: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
	visibleItemsCount,
	setVisibleItemsCount,
	totalItemsCount,
}) => {
	const step = 5;

	if (totalItemsCount <= step) {
		return null;
	}

	return (
		<div className="flex justify-center items-center mt-6">
			{visibleItemsCount < totalItemsCount && (
				<button
					type="button"
					onClick={() =>
						setVisibleItemsCount(
							Math.min(visibleItemsCount + step, totalItemsCount),
						)
					}
					className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
					aria-label="Show more items"
				>
					Show more
				</button>
			)}
			{visibleItemsCount > step && (
				<button
					type="button"
					onClick={() => setVisibleItemsCount(step)}
					className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
					aria-label="Show less items"
				>
					Show less
				</button>
			)}
		</div>
	);
};

export default memo(PaginationControls);
