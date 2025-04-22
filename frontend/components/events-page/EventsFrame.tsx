"use client";

import {
	EventDisplayData,
	GroupDisplayData,
	GroupStateData,
	UserDisplayData,
} from "@/schemas/fe.schema";
import Link from "next/link";
import GroupSelector from "@/components/shared/GroupSelector";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import dayjs from "dayjs";
import { setEventStatusAction } from "@/actions/events.server";
import { MarkEventCompleteResponse } from "@/schemas/transaction.schema";

const animationVariants = {
	enter: (direction: number) => {
		return {
			zIndex: 0,
			opacity: 0.0,
			x: 150 * direction,
		};
	},
	center: {
		zIndex: 1,
		opacity: 1,
		x: 0,
	},
	exit: (direction: number) => {
		return {
			zIndex: 0,
			opacity: 0.0,
			x: -150 * direction,
		};
	},
};

export default function EventsPageFrame({
	userData,
}: {
	userData: UserDisplayData;
}) {
	if (userData.groups.length == 0) {
		return <div className="">No groups found!</div>;
	}

	// define state objects
	const [groupState, updateGroupState] = useState<GroupStateData>({
		direction: 1,
		index: 0,
		group: userData.groups[0],
	});

	return (
		<div className="m-auto h-max w-full max-w-5xl">
			<GroupSelector
				groups={userData.groups}
				groupState={groupState}
				groupCallback={updateGroupState}
				firstIndex={0}
			/>
			<AnimatePresence
				initial={false}
				custom={groupState.direction}
				mode="wait"
			>
				<motion.div
					custom={groupState.direction}
					variants={animationVariants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{
						x: {
							duration: 0.2,
						},
						opacity: { duration: 0.15 },
					}}
					key={groupState.index}
				>
					<EventsFrame
						userData={userData}
						groupData={groupState.group}
					/>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

function EventsFrame({
	userData,
	groupData,
}: {
	userData: UserDisplayData;
	groupData: GroupDisplayData;
}) {
	const sortedEvents = groupData.events
		.slice()
		.sort(
			(a, b) =>
				new Date(a.first_date).getTime() -
				new Date(b.first_date).getTime(),
		);

	return (
		<div className="m-auto h-max w-full max-w-xl space-y-4 rounded-lg border-[1px] border-gray-300 p-16 shadow-sm">
			<h2 className="text-3xl font-bold">Events</h2>
			<ul>
				{sortedEvents.length > 0 ? (
					sortedEvents.map((event, index) => (
						<EventItem key={index} event={event} />
					))
				) : (
					<div className="text-gray-600">No events found</div>
				)}
			</ul>
		</div>
	);
}

function EventItem({ event }: { event: EventDisplayData }) {
	const [eventState, setEventState] = useState<boolean>(event.is_complete);

	const handleClick = async () => {
		const res: MarkEventCompleteResponse = await setEventStatusAction(
			event.id,
			!event.is_complete,
		);
		if (res.success) {
			console.log(res);
			setEventState(
				res.eventStatus !== undefined
					? res.eventStatus
					: event.is_complete,
			);
		}
	};

	const editSymbol = (
		<Link href={`/events/${event.id}`}>
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
				className="event-item-edit ml-2 h-4 w-4 cursor-pointer stroke-gray-400"
			>
				<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
				<path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
			</svg>
		</Link>
	);

	return (
		<div className="event-item flex w-full flex-col flex-nowrap items-start gap-2 p-1 text-base hover:bg-gray-50">
			<div className="text-sm text-gray-500">
				{dayjs(event.first_date).format("MMMM D, YYYY")}
			</div>
			<div className="flex flex-row flex-nowrap gap-2">
				<input
					type="checkbox"
					checked={eventState}
					onClick={handleClick}
					readOnly
					className="h-6 w-6 flex-shrink-0 rounded-lg accent-purple-500"
				/>
				<div
					className={
						eventState
							? "w-full flex-shrink-0 text-gray-500 line-through"
							: "w-full flex-shrink-0"
					}
				>
					{event.name}
					{editSymbol}
				</div>
			</div>
		</div>
	);
}
