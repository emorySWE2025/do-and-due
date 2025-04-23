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
