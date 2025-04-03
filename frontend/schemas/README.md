# Schemas

- `db.schema.ts`: This file contains interfaces for the database models themselves
- `fe.schema.ts`: This file contains interfaces only used to display/track data on the frontend
- `transaction.schema.ts`: This file contains interfaces describing the FE/BE expectations for transactions

## System Transaction/Schema Planning Notes

```
// api routes
/user/create
/user/view
    [returns basically all info about a user, their username/profile photo/groups they're a member of]

/group/create
    [create a group in the db]
/group/invite
    [add specific user ids to the group (don't worry about accepting invites for now, let it be 1-sided)]
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
```
