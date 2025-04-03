import { Dayjs } from "dayjs";

// interface used to handle date state data in the home page
export interface DateStateData {
	current: Dayjs;
	display: Dayjs;
	target: Dayjs;
}

// interface used to handle group state data in the home page
export interface GroupStateData {
	direction: number;
	index: number;
	group: GroupDisplayData;
}

// expected format for general event display data passed to frontend pages
export interface EventDisplayData {
	name: string;
	date: string;
	completed: boolean;
}

// expected format for general group display data passed to frontend pages
export interface GroupDisplayData {
	id: number;
	name: string;
	events: EventDisplayData[];
}

// expected format for general user display data passed to frontend pages
export interface UserDisplayData {
	id: number;
	username: string;
	photoPath: string;
	groups: GroupDisplayData[];
}
