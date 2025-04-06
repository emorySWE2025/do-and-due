import { Dayjs } from "dayjs";

// page state interfaces ----------------------------------------------------------------
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
// --------------------------------------------------------------------------------------

// display interfaces -------------------------------------------------------------------
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
	members: string[];
	events: EventDisplayData[];
}

// expected format for general user display data passed to frontend pages
export interface UserDisplayData {
	email: string;
	id: number;
	username: string;
	photoPath: string;
	groups: GroupDisplayData[];
}
// --------------------------------------------------------------------------------------

// form data interfaces -----------------------------------------------------------------
export interface RegisterUserFormData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface LoginUserFormData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface CreateGroupFormData {
	groupName: string;
	groupMemberUsernames?: string[]; // bea: i think ideally this is an optional param at group creation
}
// --------------------------------------------------------------------------------------
