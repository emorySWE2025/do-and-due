"use client";

import {
	GroupDisplayData,
	DateStateData,
	GroupStateData,
} from "@/schemas/schema";
import { JSX, useLayoutEffect, useRef } from "react";
import { SnapList, SnapItem, useScroll } from "react-snaplist-carousel";

function GroupButton({
	group,
	currentGroupState,
	groupUpdateHandler,
	snapIndex,
	children,
}: {
	group: GroupDisplayData;
	currentGroupState: GroupStateData;
	groupUpdateHandler: CallableFunction;
	snapIndex: number;
	children: JSX.Element[] | JSX.Element | null | string;
}) {
	const handleClick = () => {
		groupUpdateHandler(snapIndex, group);
	};
	const isSelected: boolean = group.id === currentGroupState.group.id;
	return (
		<div
			className={`flex h-max w-max cursor-pointer flex-row flex-nowrap items-center gap-2 rounded pt-2 pr-4 pb-2 pl-4 text-sm hover:bg-gray-50 ${
				isSelected ? "bg-purple-100 hover:bg-purple-200" : ""
			}`}
			onClick={handleClick}
		>
			{children}
		</div>
	);
}

export default function GroupSelector({
	groups,
	groupState,
	groupCallback,
}: {
	groups: GroupDisplayData[];
	groupState: GroupStateData;
	groupCallback: CallableFunction;
}) {
	const snapList = useRef<HTMLDivElement>(null);
	const lastSnapItem = useRef<HTMLDivElement>(null);
	const goToSnapItem = useScroll({ ref: snapList });

	const groupUpdateHandler = (
		newIndex: number,
		newGroup: GroupDisplayData,
	) => {
		groupCallback({
			direction: newIndex > groupState.index ? 1 : -1,
			index: newIndex,
			group: newGroup,
		});

		goToSnapItem(newIndex);
		lastSnapItem.current?.focus();
	};

	useLayoutEffect(() => {
		const container = snapList.current;
		if (container) {
			// center the scroll position initially
			container.scrollLeft =
				(container.scrollWidth - container.clientWidth) / 2;
		}
	}, []);

	return (
		<div className="relative w-full border-b-[1px] border-gray-200 pt-4 pb-4">
			<SnapList
				ref={snapList}
				direction={"horizontal"}
				width="100%"
				height="max-content"
				disableScroll={true}
				className="snap-container flex flex-row items-center bg-clip-border"
			>
				{groups.map((group, index) =>
					group.id === -1 ? (
						<SnapItem
							className="snap-item"
							snapAlign="center"
							key={index}
						>
							<GroupButton
								group={group}
								currentGroupState={groupState}
								groupUpdateHandler={groupUpdateHandler}
								snapIndex={index}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-6 w-6 stroke-gray-500"
								>
									<path d="M5 12h14" />
									<path d="M12 5v14" />
								</svg>
								<div>Create group</div>
							</GroupButton>
						</SnapItem>
					) : (
						<SnapItem
							className="snap-item"
							snapAlign="center"
							key={index}
						>
							<GroupButton
								group={group}
								currentGroupState={groupState}
								groupUpdateHandler={groupUpdateHandler}
								snapIndex={index}
							>
								{group.name}
							</GroupButton>
						</SnapItem>
					),
				)}
			</SnapList>
		</div>
	);
}
