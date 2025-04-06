import { User, Group, Event } from "./db.schema";

// register user ------------------------------------------------------------------------
export interface RegisterUserRequest {
	username: string;
	email: string;
	password: string;
}

export interface RegisterUserClientResponse {
	// response shared to the client
	ok: boolean;
	message: string;
}
// --------------------------------------------------------------------------------------

// login user ---------------------------------------------------------------------------
export interface LoginUserRequest {
	username: string;
	password: string;
}
export interface LoginUserClientResponse {
	// response shared to the client
	ok: boolean;
	message: string;
}
// --------------------------------------------------------------------------------------

// NOT IMPLEMENTED ON THE BACKEND YET AFAIK
// view public user data (requested by another user account) ----------------------------
export interface ViewPublicUserRequest {
	// fe > be
	// params necessary to view data about a user
	username: string;
}

export interface PublicUserData {
	username: string;
	photoUrl: string;
}

export interface ViewPublicUserResponse {
	userExists: boolean;
	userData?: PublicUserData; // optional, only returned if this user exists
}
// --------------------------------------------------------------------------------------

// create group -------------------------------------------------------------------------
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
export interface CreateGroupClientResponse {
	// response shared to the client
	ok: boolean;
	message: string;
}
// --------------------------------------------------------------------------------------

// view detailed group data -------------------------------------------------------------
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
	// groupCosts: Cost[]; // [Array of Cost items (costId, costName, costAmount)]
}
// --------------------------------------------------------------------------------------

// bea: maybe we can replace the transaction below with just an edit/update group call so we can use it for more?
// add user to group --------------------------------------------------------------------
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
// --------------------------------------------------------------------------------------

// create event -------------------------------------------------------------------------
export interface AddEventRequest {
	name: string;
	date: string; // Format: "%Y-%m-%d %H:%M:%S" Lmk if you want to change this -Lance
	repeatEvery?: string; // Should be in the set {"Daily", "Weekly", "Monthly"}

	memberNames: string[]; // Usernames

	groupId: number;
}

export interface AddEventResponse {
	success: boolean;
	message: string;
}
// --------------------------------------------------------------------------------------

// change users assigned to event -------------------------------------------------------
export interface ChangeEventMembersRequest {
	name: string;
	memberNames: string[]; // Usernames
	groupId: number;
}

export interface ChangeEventMembersResponse {
	success: boolean;
	message: string;
}

// --------------------------------------------------------------------------------------
