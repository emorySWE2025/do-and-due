`
// api routes
/user/create
/user/view
    [returns basically all info about a user, their username/profile photo/groups they're a member of]

/group/create
    [create a group in the db]
/group/invite
    [add a specific user id to the group (don't worry about accepting invites for now, let it be 1-sided)]
/group/view
    [request detailed info about a group (other members, events, costs etc.)]


/event/create
    [create an event in a specific group, 1 specified day, assign members]

// i don't think a view route is needed, we could use /group/view to get all events in a group for now

necessary mvp actions 
1. authentication
    [
        needed parts:
        - user database model
        - create user api route
        - auth is set up already
        - view user details api route
    ]
    1. create user accounts
    2. validate user credentials (all the standard auth stuff)
    3. view user accounts

2. groups
    [
        needed parts:
        - group database model [label + members]
        - create group api route
        - add user to group api route
        - view group details api route (public/private variant {wait for later?})
    ]
    1. create groups
    2. add users to groups (we can ignore search etc for now)

3. events
    [
        needed parts:
    ]
    1. add events [some date + must at least be associated with group?]
    2. delete events
`;

// this file should always be kept consistent with our current database model schemas

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

	costs: Cost[];
	receipts: Cost[];
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

export interface Cost {
	id: number;
	name: string;
	category: string; // ['food', 'utilities', etc.? maybe make these customizable in a group]
	amount: number;

	recipientId: number;
	recipient: User;

	senderIds: number[];
	senders: User[];

	groupId: number;
	group: Group;
}

export interface Group {
	id: number;
	name: string;
	status: string; // [e.g.: ('active', 'archived')]
	expiration: string | null; // [Optional, only present for temp groups]
	timezone: string; // timezone used for all group events

	creatorId: number;
	creator?: User; // [User item that created the group, transferrable?]

	memberIds: number[];
	members?: User[]; // [Array of User items]

	eventIds: number[];
	events?: Event[]; // [Array of Event items, each should refer to a recurring/individual task/event which should be displayed on the group calendar]

	costIds: number[];
	costs?: Cost[]; // [Array of Cost items, each should refer to a cost which is divvied up between selected members in the group]
	// [Theming options for users to customize colors/other?]
}
