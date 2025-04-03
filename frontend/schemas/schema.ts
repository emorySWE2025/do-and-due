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

export interface AddUserRequest {
	// fe > be
	// params necessary to add a user in the backend
}

export interface AddUserResponse {
	// be > fe
	// params we can expect to receive from the backend when trying to add a user
	message: string;
}

// database schemas
export interface User {
	id: number;
	name: string;
	username: string;
	// password: string; # this should never be shared to the frontend, lets just validate it backend
	email: string;
	photoUrl: string;

	ownedGroups: Group[];
	joinedGroups: Group[];

	events: Event[];

	// costs: Cost[];
	// receipts: Cost[];
}

export interface Group {
	id: number;
	name: string;
	status: string; // [e.g.: ('active', 'archived')]
	expiration: string | null; // [Optional, only present for temp groups]
	// timezone: string; // timezone used for all group events. bea: lets just ignore this for now :)

	creatorId: number;
	creator?: User; // [User item that created the group]

	memberIds: number[];
	members?: User[]; // [Array of User items]

	eventIds: number[];
	events?: Event[]; // [Array of Event items, each should refer to a recurring/individual task/event which should be displayed on the group calendar]

	// costIds: number[];
	// costs?: Cost[]; // [Array of Cost items, each should refer to a cost which is divvied up between selected members in the group]
	// [Theming options for users to customize colors/other?]
}

export interface Event {
	id: number;
	name: string;
	date: string;
	// firstDate: string; // assuming dates/times will arrive as strings?
	// firstTime: string;
	// repeatEvery: string | null;

	memberIds: number[];
	members: User[];

	groupId: number;
	group: Group;
}

// as discussed, not requiring for MVP
// export interface Cost {
// 	id: number;
// 	name: string;
// 	category: string; // ['food', 'utilities', etc.? maybe make these customizable in a group]
// 	amount: number;

// 	recipientId: number;
// 	recipient: User;

// 	senderIds: number[];
// 	senders: User[];

// 	groupId: number;
// 	group: Group;
// }

export interface AddEventRequest {
	name: string;
	date: string; // Format: "%Y-%m-%d %H:%M:%S" Lmk if you want to change this -Lance

	memberIds: number[];

	groupId: number;
}

export interface AddEventResponse {
	success: boolean;
	message: string;
}

export interface ViewGroupRequest {
	// fe > be
	// params necessary to view a group in the backend
	groupId: number;
}

export interface ViewGroupResponse {
	// be > fe
	// params we can expect to receive from the backend when trying to view a group
	groupId: number;
	groupName: string;
	groupStatus: string;
	groupExpiration: string | null;
	groupTimezone: string;
	groupCreator: User;
	groupMembers: User[]; // bea: here i think we could actually retrieve the user objects to make displaying stuff like profile pictures easier?
	// groupCreatorUsername: string;
	// groupMemberUsernames: string[]; // [Array of usernames]
	groupEvents: Event[]; // [Array of Event items (eventId, eventName)]
	groupCosts: Cost[]; // [Array of Cost items (costId, costName, costAmount)]
}

export interface CreateGroupRequest {
	// fe > be
	// params necessary to create a group in the backend
	groupName: string;
	groupStatus: string;
	groupExpiration: string | null;
	groupTimezone: string;
	// groupCreator: User; // not sure if we should send an actual object here or just a username/id?
	groupCreatorId: number;
}

export interface CreateGroupResponse {
	// be > fe
	// params we can expect to receive from the backend when trying to create a group
	message: string;
	status: number;
}

export interface AddUsersToGroupRequest {
	// fe > be
	// params necessary to add users to a group in the backend
	groupId: number;
	usernames: string[]; // [Array of usernames]
}

export interface AddUsersToGroupResponse {
	// be > fe
	// params we can expect to receive from the backend when trying to add users to a group
	message: string;
	result: { success: string[]; failure: string[] }; // not sure about this. i think this will be a dict.
	// e.g. {"results": {"success": ["user1", "user2"], "not_found": ["nonexistent_user"]}}
	// bea: we can define it like this and pass usernames as arrays of strings
	status: number;
}
