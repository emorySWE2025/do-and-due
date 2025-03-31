"use client";

import { EventDisplayData, GroupDisplayData } from "@/schema";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

interface ToDo {
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

export default function ToDoFrame({
	groupData,
	targetDate,
	setTargetDate,
}: {
	groupData: GroupDisplayData;
	targetDate: Dayjs;
	setTargetDate: CallableFunction;
}) {
	const handlePrevDay = () => {
		setTargetDate(targetDate.subtract(1, "day"));
	};

	const handleNextDay = () => {
		setTargetDate(targetDate.add(1, "day"));
	};

	const relevantEvents: EventDisplayData[] = filterEventsByDate(
		groupData.events,
		targetDate,
	);

	return (
		<div className="h-max w-1/2 rounded-lg border-[1px] border-gray-300 p-4 shadow-sm">
			<div className="h-max w-full text-center text-lg font-[500]">
				To-Do
			</div>
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
				<div className="w-full text-center text-sm leading-6 text-gray-600">
					{targetDate.format("MMMM D, YYYY")}
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
				{relevantEvents.map((event: EventDisplayData, idx: number) => (
					<EventItem key={idx} event={event} />
				))}
			</div>
		</div>
	);
}
