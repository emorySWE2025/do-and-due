import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary";
}

export default function Button({
	children,
	className,
	variant = "primary",
	...props
}: ButtonProps) {
	const baseClasses = "py-2 px-4 rounded-md text-white font-semibold";

	const variantClasses = {
		primary: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
		secondary: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
	};

	return (
		<button
			{...props}
			className={`${baseClasses} ${variantClasses[variant]} focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
		>
			{children}
		</button>
	);
}
