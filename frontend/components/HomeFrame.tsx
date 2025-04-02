"use client";

import CalendarFrame from "@/components/CalendarFrame";
import ToDoFrame from "@/components/ToDoFrame";
import { GroupDisplayData, UserDisplayData } from "@/schema";
import dayjs, { Dayjs } from "dayjs";
import GroupSelector from "@/components/GroupSelector";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import Form from "next/form";
import CreateGroupFrame from "./CreateGroupFrame";

export default function HomeFrame({ userData }: { userData: UserDisplayData }) {
	// this group object will be used to indicate when the user wants to create a new group
	const createNewGroupPlaceholder: GroupDisplayData = {
		id: -1,
		name: "new group",
		events: [],
	};

	// defaults to null if the user is not in any groups, otherwise defaults to the first
	const [currentGroup, setCurrentGroup] = useState<GroupDisplayData>(
		userData.groups.length > 0
			? userData.groups[0]
			: createNewGroupPlaceholder,
	);
	// current date
	const currentDate: Dayjs = dayjs();

	// date displayed on the calendar
	const [displayDate, setDisplayDate] = useState<Dayjs>(currentDate);

	// date targeted on the calendar and shown on the todo list
	const [targetDate, setTargetDate] = useState<Dayjs>(currentDate);

	const homeContents =
		currentGroup.id !== -1 ? (
			<div className="flex h-full w-full flex-row flex-nowrap gap-12 p-10">
				<ToDoFrame
					key={`${currentGroup.id}-todos`}
					groupData={currentGroup}
					targetDate={targetDate}
					setTargetDate={setTargetDate}
				/>
				<CalendarFrame
					key={`${currentGroup.id}-calendar`}
					groupData={currentGroup}
					currentDate={currentDate}
					displayDate={displayDate}
					setDisplayDate={setDisplayDate}
					targetDate={targetDate}
					setTargetDate={setTargetDate}
				/>
			</div>
		) : (
			<CreateGroupFrame key="create-group-frame" />
		);

	return (
		<div className="m-auto h-max w-full max-w-5xl">
			<GroupSelector
				groups={[createNewGroupPlaceholder].concat(userData.groups)}
				setGroupCallback={setCurrentGroup}
				currentGroupId={currentGroup?.id}
			/>
			<AnimatePresence>{homeContents}</AnimatePresence>
		</div>
	);
}
