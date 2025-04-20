"use client";

import {
	createEventAction,
	setEventStatusAction,
} from "@/actions/events.server";
import {
	EventDisplayData,
	GroupDisplayData,
	DateStateData,
} from "@/schemas/fe.schema";
import dayjs, { Dayjs } from "dayjs";
import { JSX, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ErrorPopup, ErrorText } from "@/components/Errors";
import Input from "@/components/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema } from "@/actions/zod";
import Button from "@/components/Button";
import { MarkEventCompleteResponse } from "@/schemas/transaction.schema";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EventsFrame({
	groupData,
	dateState,
	dateCallback,
}: {
	groupData: GroupDisplayData;
	dateState: DateStateData;
	dateCallback: CallableFunction;
}) {
	const [showAddEventForm, setAddEventState] = useState<boolean>(false);
	const toggleAddEventState = () => {
		setAddEventState(!showAddEventForm);
	};

	return (
		<div className="h-max w-2/5 rounded-lg border-[1px] border-gray-300 p-4 shadow-sm">
			{showAddEventForm ? (
				<AddEventForm
					groupData={groupData}
					dateState={dateState}
					toggleAddEventState={toggleAddEventState}
				/>
			) : (
				<EventsDisplay
					groupData={groupData}
					dateState={dateState}
					dateCallback={dateCallback}
					toggleAddEventState={toggleAddEventState}
				/>
			)}
		</div>
	);
}

// function AddEventForm() {}

function AddEventForm({
	groupData,
	dateState,
	toggleAddEventState,
}: {
	groupData: GroupDisplayData;
	dateState: DateStateData;
	toggleAddEventState: CallableFunction;
}) {
	const {
		register,
		handleSubmit,
		setError,
		watch,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(createEventSchema),
		defaultValues: {
			repeats: "None",
		},
	});
	const router = useRouter();
	const repeatValue = watch("repeats");

	const onSubmit = async (data: any) => {
		console.log("Submitting event with data:", data);
		const res = await createEventAction(data, groupData);
		console.log("AddEventForm response:", res);
		if (res.ok) {
			toggleAddEventState();
			// Use router.refresh() instead of push to refresh the page data without a full navigation
			router.refresh();
		} else {
			console.error("Failed to create event:", res.message);
		}
	};

	return (
		<div className="w-full">
			<button
				onClick={() => toggleAddEventState()}
				className="mb-8 rounded-lg hover:bg-gray-50"
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
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="w-full space-y-6"
			>
				{errors.root && <ErrorPopup message={errors.root.message} />}
				<div>
					<Input
						type="text"
						{...register("name")}
						label="Event Name"
					/>
					{errors.name && <ErrorText message={errors.name.message} />}
				</div>

				<div>
					<Input
						type="text"
						{...register("date")}
						label="First Date"
						value={dateState.target.format("YYYY-MM-DD")}
						disabled
					/>
					{errors.date && <ErrorText message={errors.date.message} />}
				</div>

				<div>
					<Input
						type="text"
						{...register("members")}
						label="Members (separated by spaces)"
					/>
					{errors.members && (
						<ErrorText message={errors.members.message} />
					)}
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium text-gray-700">
						Repeats
					</label>
					<div className="flex space-x-2 overflow-x-auto pb-2">
						{["None", "Daily", "Weekly", "Monthly", "Yearly"].map(
							(option, index) => (
								<label
									key={option}
									className="flex-shrink-0 cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm transition-all duration-200 hover:border-purple-500 hover:shadow"
								>
									<input
										type="radio"
										value={option}
										checked={repeatValue === option}
										{...register("repeats")}
										className="peer hidden"
									/>
									<span className="peer-checked:font-semibold peer-checked:text-purple-600">
										{option}
									</span>
								</label>
							),
						)}
					</div>
					{/* {errors.repeats && (
						<ErrorText message={errors.repeats.message} />
					)} */}
				</div>

				<Button
					className="w-full"
					type="submit"
					disabled={isSubmitting}
				>
					Submit
				</Button>
			</form>
		</div>
	);
}

function EventsDisplay({
	groupData,
	dateState,
	dateCallback,
	toggleAddEventState,
}: {
	groupData: GroupDisplayData;
	dateState: DateStateData;
	dateCallback: CallableFunction;
	toggleAddEventState: CallableFunction;
}) {
	const handlePrevDay = () => {
		dateCallback({
			current: dateState.current,
			display: dateState.display,
			target: dateState.target.subtract(1, "day"),
		});
	};

	const handleNextDay = () => {
		dateCallback({
			current: dateState.current,
			display: dateState.display,
			target: dateState.target.add(1, "day"),
		});
	};

	const [relevantEvents, setRelevantEvents] = useState<EventDisplayData[]>(
		filterEventsByDate(groupData.events, dateState.target),
	);

	useEffect(() => {
		setRelevantEvents(
			filterEventsByDate(groupData.events, dateState.target),
		);
	}, [groupData, dateState]);
	// const relevantEvents: EventDisplayData[] = filterEventsByDate(
	// 	groupData.events,
	// 	dateState.target,
	// );

	const eventItemsDisplay: JSX.Element | JSX.Element[] =
		relevantEvents.length === 0 ? (
			<div className="text-center text-sm text-gray-400">
				nothing scheduled!
			</div>
		) : (
			relevantEvents.map((event: EventDisplayData) => (
				<EventItem key={event.id} event={event} />
			))
		);

	return (
		<div className="w-full">
			<div className="flex h-max w-full flex-row flex-nowrap items-center justify-between p-1">
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
				<div className="w-full text-center text-lg font-[500]">
					{dateState.target.format("MMMM D, YYYY")}
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

			<div className="flex w-full flex-col gap-2 p-6">
				{eventItemsDisplay}
			</div>
			<AddEventButton toggleAddEventState={toggleAddEventState} />
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
		<div className="event-item flex w-full flex-row flex-nowrap items-start gap-2 p-1 text-base hover:bg-gray-50">
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
	);
}

function filterEventsByDate(events: EventDisplayData[], targetDate: Dayjs) {
	return events.filter((event) => {
		// Use startOf('day') to ignore time component for comparisons
		const eventDate = dayjs(event.first_date).startOf("day");
		const targetDateStart = targetDate.startOf("day");

		// Check if it's the same day (for non-repeating or first occurrence)
		if (eventDate.isSame(targetDateStart, "day")) {
			return true;
		}

		// Handle repeating events: Ensure repeat_every is valid and not "None"
		if (event.repeat_every && event.repeat_every !== "None") {
			// Only check events that started on or before the target date
			if (eventDate.isAfter(targetDateStart)) {
				return false;
			}

			// No need for daysDiff for weekly/monthly/yearly checks here, compare date parts directly

			switch (event.repeat_every) {
				case "Daily":
					// Event occurs daily on or after its start date
					return !eventDate.isAfter(targetDateStart);
				case "Weekly":
					// Event occurs on the same day of the week, on or after its start date
					return (
						eventDate.day() === targetDateStart.day() &&
						!eventDate.isAfter(targetDateStart)
					);
				case "Monthly":
					// Same day of month, on or after its start date
					return (
						eventDate.date() === targetDateStart.date() &&
						!eventDate.isAfter(targetDateStart)
					);
				case "Yearly":
					// Same day and month, on or after its start date
					return (
						eventDate.date() === targetDateStart.date() &&
						eventDate.month() === targetDateStart.month() &&
						!eventDate.isAfter(targetDateStart)
					);
				default:
					// Handle unexpected repeat_every values gracefully
					console.warn(
						`Unexpected repeat_every value in filterEventsByDate: ${event.repeat_every}`,
					);
					return false;
			}
		}

		return false;
	});
}

function AddEventButton({
	toggleAddEventState,
}: {
	toggleAddEventState: CallableFunction;
}) {
	const plusIcon: JSX.Element = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="inherit"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-6 w-6"
		>
			<path d="M5 12h14" />
			<path d="M12 5v14" />
		</svg>
	);
	return (
		<div
			className="hover-text-purple-600 m-auto flex h-max w-max cursor-pointer flex-row flex-nowrap items-center gap-2 rounded-lg border-[1px] border-gray-200 stroke-gray-500 pt-2 pr-4 pb-2 pl-4 text-sm text-gray-600 hover:bg-gray-50 hover:stroke-purple-400 hover:text-purple-500"
			onClick={() => toggleAddEventState()}
		>
			{plusIcon}
			<div>Add event</div>
		</div>
	);
}
