"use client";

import CalendarFrame from "@/components/CalendarFrame";
import ToDoFrame from "@/components/ToDoFrame";
import { GroupDisplayData, UserDisplayData } from "@/schema";
import dayjs, { Dayjs } from "dayjs";
import GroupSelector from "@/components/GroupSelector";
import { useState } from "react";

export default function HomeFrame({ userData }: { userData: UserDisplayData }) {
	// defaults to null if the user is not in any groups, otherwise defaults to the first
	const [currentGroup, setCurrentGroup] = useState<GroupDisplayData | null>(
		userData.groups.length > 0 ? userData.groups[0] : null,
	);
	// current date
	const currentDate: Dayjs = dayjs();

	// date displayed on the calendar
	const [displayDate, setDisplayDate] = useState<Dayjs>(currentDate);

	// date targeted on the calendar and shown on the todo list
	const [targetDate, setTargetDate] = useState<Dayjs>(currentDate);

	const homeContents =
		currentGroup !== null ? (
			<div className="flex h-full w-full flex-row flex-nowrap gap-12 p-10">
				<ToDoFrame
					groupData={currentGroup}
					targetDate={targetDate}
					setTargetDate={setTargetDate}
				/>
				<CalendarFrame
					groupData={currentGroup}
					currentDate={currentDate}
					displayDate={displayDate}
					setDisplayDate={setDisplayDate}
					targetDate={targetDate}
					setTargetDate={setTargetDate}
				/>
			</div>
		) : (
			<div className="">Please select a group</div>
		);

	return (
		<div className="m-auto h-max w-full max-w-5xl">
			<GroupSelector
				groups={userData.groups}
				setGroupCallback={setCurrentGroup}
				currentGroupId={currentGroup?.id}
			/>
			{homeContents}
		</div>
	);
}
