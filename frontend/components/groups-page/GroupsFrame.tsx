"use client";

import React from "react";
import GroupCard from "./GroupCard";
import { GroupDisplayData } from "@/schemas/fe.schema";

export default function GroupsFrame({
	GroupsData,
}: {
	GroupsData: GroupDisplayData[];
}) {
	return (
		// map through group data to card component
		<div className="m-auto mt-16 h-max w-max max-w-5xl space-y-8 rounded-lg border-[1px] border-gray-300 p-16 shadow-sm">
			<h1 className="text-3xl font-bold">Groups</h1>
			<div className="flex flex-row flex-nowrap gap-8 overflow-x-auto">
				{GroupsData.map((group) => (
					<GroupCard
						key={group.id}
						groupData={group}
						onView={() => {}}
					/>
				))}
			</div>
		</div>
	);
}
