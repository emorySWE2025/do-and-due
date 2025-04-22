import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export default function Input({ label, className, ...props }: InputProps) {
	return (
		<div>
			{label && (
				<label
					htmlFor={props.id || props.name}
					className="mb-1 block text-sm font-medium text-gray-700"
				>
					{label}
				</label>
			)}
			<input
				{...props}
				className={`block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 focus:outline-none sm:text-sm ${className || ""}`}
			/>
		</div>
	);
}
