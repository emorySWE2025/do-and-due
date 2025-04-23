import React from "react";

interface ErrorPopupProps {
	message?: string;
	details?: string;
	className?: string;
	onClose?: () => void;
}

export function ErrorPopup({
	message,
	details,
	className,
	onClose,
}: ErrorPopupProps) {
	if (!message) return null;

	return (
		<div
			className={`text-black-600 relative flex items-start rounded-md border border-red-200 bg-red-100 p-5 ${className}`}
		>
			<div>
				<p className="text-sm font-medium">{message}</p>
				{details && <p className="mt-1 text-sm">{details}</p>}
			</div>

			{onClose && (
				<button
					type="button"
					onClick={onClose}
					className="absolute top-3 right-3 text-red-400 hover:text-red-600"
					aria-label="Close error message"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
			)}
		</div>
	);
}

export function ErrorText({ message }: { message: string | undefined }) {
	return <p className="mt-2 text-center text-sm text-red-500">{message}</p>;
}
