import type React from "react";
import { type StatusColor } from "../ActiveItemsList";

export const ITEM_TYPES = {
	HUMAN_RESOURCES: "Human Resources",
	FACILITIES: "Facilities",
	IT: "Information Technology",
} as const;

export type ItemType = (typeof ITEM_TYPES)[keyof typeof ITEM_TYPES];

export interface Item {
	id: number;
	title: string;
	type: ItemType;
	status: string;
	statusColor: StatusColor;
	icon: React.ComponentType<React.ComponentProps<"svg">>;
	updatedAt: string;
	url: string;
}

export const typeToColor: Record<ItemType, string> = {
	[ITEM_TYPES.HUMAN_RESOURCES]: "text-purple-500",
	[ITEM_TYPES.FACILITIES]: "text-blue-500",
	[ITEM_TYPES.IT]: "text-green-500",
};
