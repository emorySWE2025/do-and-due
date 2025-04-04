"use client";

import CalendarFrame from "@/components/CalendarFrame";
import ToDoFrame from "@/components/ToDoFrame";
import GroupSelector from "@/components/GroupSelector";
import CreateGroupFrame from "@/components/CreateGroupFrame";
import {withAuth} from "@/components/UserAuthCheck";
import FetchUserData from "@/components/FetchUserData";

import {
	DateStateData,
	GroupDisplayData,
	GroupStateData,
	UserDisplayData,
} from "@/schemas/fe.schema";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

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

function HomeFrameContents({
	userData,
	groupData,
	dateState,
	dateCallback,
}: {
	userData: UserDisplayData;
	groupData: GroupDisplayData;
	dateState: DateStateData;
	dateCallback: CallableFunction;
}) {
	if (groupData.id === -1) {
		return <CreateGroupFrame userId={userData.id} />;
	} else {
		return (
			<div className="flex h-max w-full flex-row flex-nowrap gap-8 pt-8">
				<ToDoFrame
					groupData={groupData}
					dateState={dateState}
					dateCallback={dateCallback}
				/>
				<CalendarFrame
					groupData={groupData}
					dateState={dateState}
					dateCallback={dateCallback}
				/>
			</div>
		);
	}
}

function HomePage() {
	// query current date
	const currentDate: Dayjs = dayjs();

	const { userData, loading, error } = FetchUserData();

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!userData) return <div>No user data found.</div>;

	// this group object will be used to indicate when the user wants to create a new group
	const createNewGroupPlaceholder: GroupDisplayData = {
		id: -1,
		name: "new group",
		events: [],
	};

	return (
 		<HomeFrame createNewGroupPlaceholder={createNewGroupPlaceholder} userData={userData} />
	);
}

function HomeFrame({ createNewGroupPlaceholder, userData }: {
    createNewGroupPlaceholder: GroupDisplayData;
    userData: UserDisplayData;
}) {
	// define state objects
	const [groupState, updateGroupState] = useState<GroupStateData>({
		direction: 1,
		index: 0,
		group: createNewGroupPlaceholder,
	});

	const [dateState, updateDateState] = useState<DateStateData>({
		current: dayjs(),
		display: dayjs(),
		target: dayjs(),
	});

	return (
		<div className="m-auto h-max w-full max-w-5xl">
			<GroupSelector
				groups={[createNewGroupPlaceholder].concat([])}
				groupState={groupState}
				groupCallback={updateGroupState}
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
					<HomeFrameContents
						groupData={groupState.group}
						dateState={dateState}
						dateCallback={updateDateState}
						userData={userData}
					/>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
export default withAuth(HomePage);
