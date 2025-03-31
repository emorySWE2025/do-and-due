"use client";

import { Dispatch, JSX, SetStateAction, use, useState } from "react";
import CalendarFrame from "@/components/CalendarFrame";
import ToDoFrame from "@/components/ToDoFrame";
import { GroupDisplayData, UserDisplayData } from "@/schema";
import dayjs, { Dayjs } from "dayjs";

// function getGroupById(userData: UserDisplayData, targetGroupId: number) {
// 	return (
// 		userData.groups.find(
// 			(group: GroupDisplayData) => group.id === targetGroupId,
// 		) || null
// 	);
// }

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

function GroupSelectorButton({
	group,
	currentGroupId,
	setGroupCallback,
}: {
	group: GroupDisplayData;
	currentGroupId: number | undefined;
	setGroupCallback: CallableFunction;
}) {
	const handleClick = () => setGroupCallback(group);
	// make an explicit new version of this component to create new groups
	// should it redirect the user or just set a diff page state?
	const isSelected: boolean = group.id === currentGroupId;
	if (isSelected) {
		return (
			<div
				className="cursor-pointer rounded bg-purple-100 p-2 text-sm hover:bg-purple-200"
				onClick={handleClick}
			>
				{group.name}
			</div>
		);
	} else {
		return (
			<div
				className="cursor-pointer rounded p-2 text-sm hover:bg-gray-50"
				onClick={handleClick}
			>
				{group.name}
			</div>
		);
	}
}

function GroupSelector({
	groups,
	currentGroupId,
	setGroupCallback,
}: {
	groups: GroupDisplayData[];
	currentGroupId: number | undefined;
	setGroupCallback: CallableFunction;
}) {
	return (
		<div className="flex flex-row flex-nowrap items-center justify-center gap-8 border-b-[1px] border-gray-200 p-4">
			{/* <NewGroupButton /> */}
			{groups.map((group: GroupDisplayData) => (
				<GroupSelectorButton
					key={group.id}
					group={group}
					currentGroupId={currentGroupId}
					setGroupCallback={setGroupCallback}
				/>
			))}
		</div>
	);
}
