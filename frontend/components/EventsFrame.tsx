"use client";

import {
	EventDisplayData,
	GroupDisplayData,
	DateStateData,
} from "@/schemas/fe.schema";
import dayjs, { Dayjs } from "dayjs";
import { JSX } from "react";

interface Event {
	label: string;
	completed: boolean;
}

function EventItem({ event }: { event: EventDisplayData }) {
	return (
		<div className="flex items-start gap-2 p-1 text-base hover:bg-gray-50">
			<input
				type="checkbox"
				checked={event.completed}
				readOnly
				className="h-6 w-6 rounded-lg accent-purple-500"
			/>
			<span
				className={event.completed ? "text-gray-500 line-through" : ""}
			>
				{event.name}
			</span>
		</div>
	);
}

function filterEventsByDate(events: EventDisplayData[], targetDate: Dayjs) {
	return events.filter((event) =>
		dayjs(event.date).isSame(targetDate, "day"),
	);
}

export default function EventsFrame({
	groupData,
	dateState,
	dateCallback,
}: {
	groupData: GroupDisplayData;
	dateState: DateStateData;
	dateCallback: CallableFunction;
}) {
	const handlePrevDay = () => {
		dateCallback({
			current: dateState.current,
			display: dateState.display,
			target: dateState.target.subtract(1, "day"),
		});
	};

	const handleNextDay = () => {
		dateCallback({
			current: dateState.current,
			display: dateState.display,
			target: dateState.target.add(1, "day"),
		});
	};

	const relevantEvents: EventDisplayData[] = filterEventsByDate(
		groupData.events,
		dateState.target,
	);
	const eventDisplay: JSX.Element | JSX.Element[] =
		relevantEvents.length === 0 ? (
			<div className="text-center text-sm text-gray-400">
				nothing scheduled!
			</div>
		) : (
			relevantEvents.map((event: EventDisplayData, idx: number) => (
				<EventItem key={idx} event={event} />
			))
		);

	return (
		<div className="h-max w-1/2 rounded-lg border-[1px] border-gray-300 p-4 shadow-sm">
			<div className="flex h-max flex-row flex-nowrap items-center justify-between p-1">
				<button
					onClick={handlePrevDay}
					className="rounded-lg hover:bg-gray-50"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="rounded-lg stroke-gray-400 hover:stroke-purple-500"
					>
						<path d="m15 18-6-6 6-6" />
					</svg>
				</button>
				<div className="w-full text-center text-lg font-[500]">
					{dateState.target.format("MMMM D, YYYY")}
				</div>
				<button
					onClick={handleNextDay}
					className="rounded-lg hover:bg-gray-50"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="rounded-lg stroke-gray-400 hover:stroke-purple-500"
					>
						<path d="m9 18 6-6-6-6" />
					</svg>
				</button>
			</div>

			<div className="flex flex-col flex-nowrap gap-2 p-6">
				{eventDisplay}
			</div>
			<NewItemButton />
		</div>
	);
}

function NewItemButton() {
	const plusIcon: JSX.Element = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="inherit"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-6 w-6"
		>
			<path d="M5 12h14" />
			<path d="M12 5v14" />
		</svg>
	);
	return (
		<div className="hover-text-purple-600 m-auto flex h-max w-max flex-row flex-nowrap items-center gap-2 rounded-lg border-[1px] border-gray-200 stroke-gray-500 pt-2 pr-4 pb-2 pl-4 text-sm text-gray-600 hover:bg-gray-50 hover:stroke-purple-400 hover:text-purple-500">
			{plusIcon}
			<div>Add event</div>
		</div>
	);
}
