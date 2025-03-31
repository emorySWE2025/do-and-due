"use client";

import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import { EventDisplayData, GroupDisplayData } from "@/schema";

dayjs.extend(weekday);
dayjs.extend(localeData);

export default function CalendarFrame({
	groupData,
	currentDate,
	displayDate,
	setDisplayDate,
	targetDate,
	setTargetDate,
}: {
	groupData: GroupDisplayData;
	currentDate: Dayjs;
	displayDate: Dayjs;
	setDisplayDate: CallableFunction;
	targetDate: Dayjs;
	setTargetDate: CallableFunction;
}) {
	const handlePrevMonth = () => {
		setDisplayDate(displayDate.subtract(1, "month"));
	};

	const handleNextMonth = () => {
		setDisplayDate(displayDate.add(1, "month"));
	};

	const eventDates: Set<number> = getEventDatesInMonth(
		groupData.events,
		displayDate,
	);

	return (
		<div className="h-max w-full rounded-lg border-[1px] border-gray-300 p-4 shadow-sm">
			<CalendarHeader
				currentDate={displayDate}
				onPrev={handlePrevMonth}
				onNext={handleNextMonth}
			/>
			<CalendarGrid
				eventDates={eventDates}
				displayDate={displayDate}
				currentDate={currentDate}
				targetDate={targetDate}
				setTargetDate={setTargetDate}
			/>
		</div>
	);
}

type CalendarHeaderProps = {
	currentDate: Dayjs;
	onPrev: () => void;
	onNext: () => void;
};

function CalendarHeader({ currentDate, onPrev, onNext }: CalendarHeaderProps) {
	return (
		<div className="flex items-center justify-between p-1">
			<button onClick={onPrev} className="rounded-lg hover:bg-gray-50">
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
					className="stroke-gray-400 hover:stroke-purple-500"
				>
					<path d="m15 18-6-6 6-6" />
				</svg>
			</button>
			<div className="w-full text-center text-lg font-[500]">
				{currentDate.format("MMMM YYYY")}
			</div>
			<button onClick={onNext} className="rounded-lg hover:bg-gray-50">
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
					className="stroke-gray-400 hover:stroke-purple-500"
				>
					<path d="m9 18 6-6-6-6" />
				</svg>
			</button>
		</div>
	);
}

type CalendarGridProps = {
	eventDates: Set<number>;
	displayDate: Dayjs;
	currentDate: Dayjs;
	targetDate: Dayjs;
	setTargetDate: CallableFunction;
};

function getEventDatesInMonth(
	events: EventDisplayData[],
	displayDate: Dayjs,
): Set<number> {
	const eventDates = new Set<number>();

	events.forEach((event) => {
		const eventDate = dayjs(event.date);
		if (eventDate.isSame(displayDate, "month")) {
			eventDates.add(eventDate.date());
		}
	});

	return eventDates;
}

function CalendarGrid({
	eventDates,
	displayDate,
	currentDate,
	targetDate,
	setTargetDate,
}: CalendarGridProps) {
	const startOfMonth = displayDate.startOf("month");
	const endOfMonth = displayDate.endOf("month");
	const startDay = startOfMonth.weekday();
	const daysInMonth = endOfMonth.date();

	const days: (number | null)[] = Array.from(
		{ length: daysInMonth },
		(_, i) => i + 1,
	);
	const emptyDays: (number | null)[] = Array.from(
		{ length: startDay },
		() => null,
	);
	const calendarDays = [...emptyDays, ...days];
	const weeks: (number | null)[][] = [];
	for (let i = 0; i < calendarDays.length; i += 7) {
		weeks.push(calendarDays.slice(i, i + 7));
	}

	return (
		<>
			<div className="mt-2 grid grid-cols-7 gap-2 text-center font-medium text-gray-600">
				{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
					(day) => (
						<div key={day} className="p-1">
							{day}
						</div>
					),
				)}
			</div>
			<div className="grid grid-cols-7 gap-2">
				{weeks.map((week, i) =>
					week.map((day, j) => (
						<CalendarDay
							key={`${i}-${j}`}
							day={day}
							isEventDay={day ? eventDates.has(day) : false}
							currentDate={currentDate}
							displayDate={displayDate}
							targetDate={targetDate}
							setTargetDate={setTargetDate}
						/>
					)),
				)}
			</div>
		</>
	);
}

type CalendarDayProps = {
	day: number | null;
	isEventDay: boolean;
	currentDate: Dayjs;
	displayDate: Dayjs;
	targetDate: Dayjs;
	setTargetDate: CallableFunction;
};

function CalendarDay({
	day,
	isEventDay,
	currentDate,
	displayDate,
	targetDate,
	setTargetDate,
}: CalendarDayProps) {
	const handleClick = () =>
		day
			? setTargetDate(
					dayjs()
						.set("date", day)
						.set("month", displayDate.month())
						.set("year", displayDate.year()),
				)
			: null;

	const isCurrentDate: boolean =
		currentDate.date() === day &&
		currentDate.month() === displayDate.month() &&
		currentDate.year() === displayDate.year();

	const isTargetDate: boolean =
		targetDate.date() === day &&
		targetDate.month() === displayDate.month() &&
		targetDate.year() === displayDate.year();

	var classElements: string =
		"flex h-16 items-start justify-start rounded-md p-1.5 text-left text-sm font-semibold";

	// don't consider anything else if the day is null
	if (day === null) {
		classElements = classElements + " bg-gray-50";
	} else {
		// style the current date differently
		if (isCurrentDate) {
			classElements =
				classElements +
				" bg-purple-200 hover:bg-purple-300 text-purple-900";
		} else {
			classElements = classElements + " bg-gray-100 hover:bg-gray-200";
		}

		// style the target date differently
		if (isTargetDate) {
			classElements = classElements + " ring-3 ring-purple-600";
		}
	}

	return (
		<div className={classElements} onClick={handleClick}>
			{day && (
				<span
					className={
						isEventDay === true
							? "h-6 w-6 rounded-[50%] bg-purple-600 p-0.5 text-center text-white"
							: "h-6 w-6 rounded-[50%] p-0.5 text-center"
					}
				>
					{day}
				</span>
			)}
		</div>
	);
}
