"use client";

import React from "react";
import GroupCard from "./GroupCard";
import { GroupDisplayData } from "@/schemas/fe.schema";

export default function GroupsFrame({
	groupsData,
}: {
	groupsData: GroupDisplayData[];
}) {
	if (groupsData.length == 0) {
		return (
			<div className="m-auto mt-16 h-max w-max max-w-xl space-y-8 rounded-lg border-[1px] border-gray-300 p-16 shadow-sm">
				<div className="text-xl font-semibold">No Groups Found</div>
				<div className="">
					Please join a group or create a new one first!
				</div>
			</div>
		);
	}

	return (
		// map through group data to card component

			<div className="text-center p-4 mx-auto">
			<h1 className="text-3xl font-bold mb-8">Groups</h1>
			<div className="flex flex-row flex-nowrap  gap-8 overflow-x-auto">
				{GroupsData.map((group) => (
					<GroupCard
						key={group.id}
						groupData={group}
						onView={() => { } } />
				))}
			</div>
			</div>
	);
}
