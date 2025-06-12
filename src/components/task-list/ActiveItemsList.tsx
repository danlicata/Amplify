import {
	BuildingOffice2Icon,
	ComputerDesktopIcon,
	UsersIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useDeferredValue, useMemo, useState } from "react";
import { parseRelativeTime } from "../../utils/parseRelativeTime";
import ItemsTable, { type SortDirection, type SortField } from "./ItemsTable";
import PaginationControls from "./PaginationControls";
import SearchFilterBar from "./SearchFilterBar";
import { ITEM_TYPES, type Item, type ItemType } from "./types/active-item";

export const STATUS_COLORS = {
	IN_PROGRESS: "yellow",
	OPEN: "blue",
	REJECTED: "red",
	PENDING: "yellow",
	COMPLETED: "green",
	CANCELLED: "red",
	SCHEDULED: "yellow",
	IN_REVIEW: "blue",
} as const;

export type StatusColor = (typeof STATUS_COLORS)[keyof typeof STATUS_COLORS];

// Mock data - in a real app, this would come from an API
const items: Item[] = [
	{
		id: 1,
		title: "Human Resources Inquiry",
		type: ITEM_TYPES.HUMAN_RESOURCES,
		status: "In Progress",
		statusColor: STATUS_COLORS.IN_PROGRESS,
		icon: UsersIcon,
		updatedAt: "3 hours ago",
		url: "https://example.com/hr-system/inquiry",
	},
	{
		id: 2,
		title: "Facilities Maintenance Request",
		type: ITEM_TYPES.FACILITIES,
		status: "Open",
		statusColor: STATUS_COLORS.OPEN,
		icon: BuildingOffice2Icon,
		updatedAt: "Yesterday",
		url: "https://example.com/facilities/maintenance-request",
	},
	{
		id: 4,
		title: "New Employee Onboarding",
		type: ITEM_TYPES.HUMAN_RESOURCES,
		status: "In Progress",
		statusColor: STATUS_COLORS.IN_PROGRESS,
		icon: UsersIcon,
		updatedAt: "4 hours ago",
		url: "https://example.com/hr-system/onboarding",
	},
	{
		id: 5,
		title: "Office Space Renovation",
		type: ITEM_TYPES.FACILITIES,
		status: "In Progress",
		statusColor: STATUS_COLORS.IN_PROGRESS,
		icon: BuildingOffice2Icon,
		updatedAt: "5 days ago",
		url: "https://example.com/facilities/renovation",
	},
	{
		id: 6,
		title: "Software License Renewal",
		type: ITEM_TYPES.IT,
		status: "Rejected",
		statusColor: STATUS_COLORS.REJECTED,
		icon: ComputerDesktopIcon,
		updatedAt: "1 day ago",
		url: "https://example.com/it-system/licenses",
	},
	{
		id: 8,
		title: "HVAC Maintenance",
		type: ITEM_TYPES.FACILITIES,
		status: "Scheduled",
		statusColor: STATUS_COLORS.SCHEDULED,
		icon: BuildingOffice2Icon,
		updatedAt: "3 days ago",
		url: "https://example.com/facilities/hvac",
	},
	{
		id: 9,
		title: "Network Security Audit",
		type: ITEM_TYPES.IT,
		status: "In Progress",
		statusColor: STATUS_COLORS.IN_PROGRESS,
		icon: ComputerDesktopIcon,
		updatedAt: "2 days ago",
		url: "https://example.com/it-system/security",
	},
	{
		id: 10,
		title: "Performance Review",
		type: ITEM_TYPES.HUMAN_RESOURCES,
		status: "Pending",
		statusColor: STATUS_COLORS.PENDING,
		icon: UsersIcon,
		updatedAt: "4 days ago",
		url: "https://example.com/hr-system/reviews",
	},
];

const ActiveItemsList = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const deferredSearchQuery = useDeferredValue(searchQuery);
	const [sortField, setSortField] = useState<SortField>("updatedAt");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [visibleItemsCount, setVisibleItemsCount] = useState(5);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [selectedType, setSelectedType] = useState<ItemType | null>(null);

	const filteredItems = useMemo(() => {
		return items.filter(
			(item) =>
				(item.title.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
					item.type.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
					item.status
						.toLowerCase()
						.includes(deferredSearchQuery.toLowerCase())) &&
				(!selectedType || item.type === selectedType),
		);
	}, [deferredSearchQuery, selectedType]);

	const sortedItems = useMemo(() => {
		return [...filteredItems].sort((a, b) => {
			const modifier = sortDirection === "asc" ? 1 : -1;

			if (sortField === "updatedAt") {
				const timeA = parseRelativeTime(a.updatedAt);
				const timeB = parseRelativeTime(b.updatedAt);
				return (timeA - timeB) * modifier;
			}
			const aValue = a[sortField];
			const bValue = b[sortField];
			if (typeof aValue === "string" && typeof bValue === "string") {
				return aValue.localeCompare(bValue) * modifier;
			}
			return 0;
		});
	}, [filteredItems, sortField, sortDirection]);

	const paginatedItems = useMemo(() => {
		return sortedItems.slice(0, visibleItemsCount);
	}, [sortedItems, visibleItemsCount]);

	const handleSort = useCallback(
		(field: SortField) => {
			if (field === sortField) {
				setSortDirection(sortDirection === "asc" ? "desc" : "asc");
			} else {
				setSortField(field);
				setSortDirection("asc");
			}
		},
		[sortDirection, sortField],
	);

	const uniqueTypes = useMemo(() => {
		return Object.values(ITEM_TYPES);
	}, []);

	return (
		<div className="space-y-6">
			<SearchFilterBar
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				isFilterOpen={isFilterOpen}
				setIsFilterOpen={setIsFilterOpen}
				selectedType={selectedType}
				setSelectedType={setSelectedType}
				uniqueTypes={uniqueTypes}
			/>

			<ItemsTable
				items={paginatedItems}
				sortField={sortField}
				sortDirection={sortDirection}
				handleSort={handleSort}
			/>

			<PaginationControls
				visibleItemsCount={visibleItemsCount}
				setVisibleItemsCount={setVisibleItemsCount}
				totalItemsCount={filteredItems.length}
			/>
		</div>
	);
};

export default ActiveItemsList;
