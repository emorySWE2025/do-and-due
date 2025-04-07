"use server";

import { CreateGroupFormData, AddUserToGroupFormData } from "@/schemas/fe.schema";
import {
	CreateGroupRequest,
	CreateGroupClientResponse,
	AddUsersToGroupRequest,
	AddUsersToGroupResponse
} from "@/schemas/transaction.schema";

export async function createGroupAction(
	formData: CreateGroupFormData,
	creatorId: number,
): Promise<CreateGroupClientResponse> {
	// convert the form data to the format expected by the backend
	const postData: CreateGroupRequest = {
		groupName: formData.groupName,
		groupStatus: "active",
		groupExpiration: null,
		groupTimezone: "est",
		groupCreatorId: creatorId,
	};

	try {
		const res = await fetch("http://127.0.0.1:8000/api/group/create/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
			credentials: "include",
		});

		if (res.ok) {
			console.log("sign up ok");
			return { ok: true, message: "" };
		} else {
			console.log("sign up backend error");
			// if an error occurred on the backend
			return {
				ok: false,
				message: "A backend error occurred during registration!",
			};
		}
		// if an error occurred on the frontend
	} catch (error) {
		// if an error occurred on the backend
		console.log("createGroupAction", error);
		return {
			ok: false,
			message: "A frontend error occurred during registration!",
		};
	}
}

// function to add user to a group

export async function addUsersToGroupAction(
	formData: AddUserToGroupFormData,
	groupId: number,
): Promise<AddUsersToGroupResponse> {
	// convert the form data to the format expected by the backend
	const postData: AddUsersToGroupRequest = {
		groupId: groupId,
		usernames: formData.usernames,
	};

	try {
		const res = await fetch("http://127.0.0.1:8000/api/group/add-users/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
			credentials: "include",
		});

		if (res.ok) {
			console.log("sign up ok");
			return { ok: true, message: "", result: await res.json() , status: res.status };
		} else {
			console.log("sign up backend error");
			// if an error occurred on the backend
			return {
				ok: false,
				message: "A backend error occurred during registration!",
				result: await res.json(),
				status: res.status
			};
		}
		// if an error occurred on the frontend
	} catch (error) {
		// if an error occurred on the backend
		console.log("createGroupAction", error);
		return {
			ok: false,
			message: "A frontend error occurred during registration!",
			result: {success: [], failure: []},
			status: 500
		};
	}
}
