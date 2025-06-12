import React, { forwardRef, type HTMLAttributes } from "react";

/**
 * Reusable Card component that encapsulates the common card wrapper styles used throughout
 * the application. Additional props (e.g. `className`, event handlers, etc.) are forwarded
 * to the underlying `<div>` element, and a ref can be attached for direct DOM access.
 */
const baseClasses = "bg-white rounded-xl p-6 shadow-sm border border-slate-200";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	({ className = "", children, ...rest }, ref) => {
		return (
			<div
				ref={ref as React.Ref<HTMLDivElement>}
				className={`${baseClasses} ${className}`.trim()}
				{...rest}
			>
				{children}
			</div>
		);
	},
);

Card.displayName = "Card";

export default Card;
