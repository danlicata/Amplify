import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import React, { memo } from "react";
import { STATUS_COLORS } from "./ActiveItemsList";
import { type Item, typeToColor } from "./types/active-item";

export type SortField = "title" | "status" | "updatedAt";
export type SortDirection = "asc" | "desc";

interface ItemsTableProps {
	items: Item[];
	sortField: SortField;
	sortDirection: SortDirection;
	handleSort: (field: SortField) => void;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
	items,
	sortField,
	sortDirection,
	handleSort,
}) => {
	return (
		<div className="overflow-x-auto">
			<div className="inline-block min-w-full align-middle">
				<div className="overflow-hidden">
					<table
						className="min-w-full border-separate"
						style={{ borderSpacing: "0 0.5rem" }}
					>
						<thead className="bg-slate-50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
								>
									<button
										type="button"
										className="flex items-center"
										onClick={() => handleSort("title")}
										aria-label={`Sort by title ${sortField === "title" ? `(currently sorted ${sortDirection})` : ""}`}
									>
										Title
										{sortField === "title" && (
											<span className="ml-2">
												{sortDirection === "asc" ? (
													<ChevronUpIcon
														className="h-4 w-4 inline"
														aria-hidden="true"
													/>
												) : (
													<ChevronDownIcon
														className="h-4 w-4 inline"
														aria-hidden="true"
													/>
												)}
											</span>
										)}
									</button>
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
								>
									<button
										type="button"
										className="flex items-center"
										onClick={() => handleSort("status")}
										aria-label={`Sort by status ${sortField === "status" ? `(currently sorted ${sortDirection})` : ""}`}
									>
										Status
										{sortField === "status" && (
											<span className="ml-2">
												{sortDirection === "asc" ? (
													<ChevronUpIcon
														className="h-4 w-4 inline"
														aria-hidden="true"
													/>
												) : (
													<ChevronDownIcon
														className="h-4 w-4 inline"
														aria-hidden="true"
													/>
												)}
											</span>
										)}
									</button>
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
								>
									<button
										type="button"
										className="flex items-center"
										onClick={() => handleSort("updatedAt")}
										aria-label={`Sort by last updated ${sortField === "updatedAt" ? `(currently sorted ${sortDirection})` : ""}`}
									>
										Last Updated
										{sortField === "updatedAt" && (
											<span className="ml-2">
												{sortDirection === "asc" ? (
													<ChevronUpIcon
														className="h-4 w-4 inline"
														aria-hidden="true"
													/>
												) : (
													<ChevronDownIcon
														className="h-4 w-4 inline"
														aria-hidden="true"
													/>
												)}
											</span>
										)}
									</button>
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-slate-100">
							{items.map((item) => (
								<tr
									key={item.id}
									className="bg-white border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
								>
									{/* Title & Type */}
									<td className="px-6 py-4 whitespace-nowrap">
										<a
											href={item.url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-3"
										>
											<item.icon
												className={`h-8 w-8 ${
													typeToColor[item.type] || "text-slate-500"
												}`}
												aria-hidden="true"
											/>
											<div>
												<div className="text-sm font-medium text-slate-900">
													{item.title}
												</div>
												<div className="text-sm text-slate-500">
													{item.type}
												</div>
											</div>
										</a>
									</td>

									{/* Status */}
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(() => {
												switch (item.statusColor) {
													case STATUS_COLORS.IN_PROGRESS:
														return "bg-yellow-100 text-yellow-800";
													case STATUS_COLORS.OPEN:
														return "bg-blue-100 text-blue-800";
													case STATUS_COLORS.REJECTED:
														return "bg-red-100 text-red-800";
													case STATUS_COLORS.PENDING:
														return "bg-yellow-100 text-yellow-800";
													case STATUS_COLORS.COMPLETED:
														return "bg-green-100 text-green-800";
													case STATUS_COLORS.CANCELLED:
														return "bg-red-100 text-red-800";
													case STATUS_COLORS.SCHEDULED:
														return "bg-yellow-100 text-yellow-800";
													case STATUS_COLORS.IN_REVIEW:
														return "bg-blue-100 text-blue-800";
													default:
														return "";
												}
											})()}`}
										>
											{item.status}
										</span>
									</td>

									{/* Last Updated */}
									<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
										{item.updatedAt}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
export default memo(ItemsTable);
