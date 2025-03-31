import Link from "next/link";
import Image from "next/image";
import { JSX } from "react";

function NavButton({ label, href }: { label: string; href: string }) {
	return (
		<Link
			href={href}
			className="w-24 cursor-pointer rounded-lg p-2 text-center text-lg font-[500] hover:bg-gray-50 hover:text-purple-600"
		>
			{label}
		</Link>
	);
}

function NavSearchFrame() {
	// TODO: add functionality to expand icon into searchbar
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="cursor-pointer stroke-black hover:stroke-purple-600"
		>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.3-4.3" />
		</svg>
	);
}

function NavSettingsFrame() {
	return (
		<Link href={"/profile/settings"}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="cursor-pointer stroke-black hover:stroke-purple-600"
			>
				<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
		</Link>
	);
}

function NavNotificationsFrame({
	unreadNotifications,
}: {
	unreadNotifications: boolean;
}) {
	// TODO: add functionality to expand pop-up window with notifications when clicked
	const defaultNotificationSymbol: JSX.Element = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="cursor-pointer stroke-black hover:stroke-purple-600"
		>
			<path d="M10.268 21a2 2 0 0 0 3.464 0" />
			<path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
		</svg>
	);
	const unreadNotificationSymbol: JSX.Element = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="cursor-pointer stroke-black hover:stroke-purple-600"
		>
			<path d="M10.268 21a2 2 0 0 0 3.464 0" />
			<path d="M13.916 2.314A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.74 7.327A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673 9 9 0 0 1-.585-.665" />
			<circle cx="18" cy="8" r="3" />
		</svg>
	);

	const notificationSymbol: JSX.Element = unreadNotifications
		? unreadNotificationSymbol
		: defaultNotificationSymbol;
	return notificationSymbol;
}

function NavProfileFrame() {
	return (
		<Link href={"/profile"}>
			<Image
				src="/profile-placeholder.png"
				alt="Profile"
				width={48}
				height={48}
				className="cursor-pointer rounded-[50%] object-cover"
			/>
		</Link>
	);
}

export default function NavFrame() {
	return (
		<div className="m-auto flex h-max w-full max-w-5xl flex-row flex-nowrap items-center justify-between p-4">
			<div className="flex flex-row items-center gap-8">
				<Link href={"/"}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="56"
						height="56"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="cursor-pointer stroke-black hover:stroke-purple-600"
					>
						<rect width="18" height="18" x="3" y="4" rx="2" />
						<path d="M16 2v4" />
						<path d="M3 10h18" />
						<path d="M8 2v4" />
						<path d="M17 14h-6" />
						<path d="M13 18H7" />
						<path d="M7 14h.01" />
						<path d="M17 18h.01" />
					</svg>
				</Link>
				<div className="flex flex-row flex-nowrap gap-6">
					<NavButton label={"Home"} href={"/"} />
					<NavButton label={"Groups"} href={"/groups"} />
					<NavButton label={"People"} href={"/people"} />
				</div>
			</div>
			<div className="flex flex-row flex-nowrap items-center gap-6">
				<NavSearchFrame />
				<NavSettingsFrame />
				<NavNotificationsFrame unreadNotifications={false} />
				<NavProfileFrame />
			</div>
		</div>
	);
}
