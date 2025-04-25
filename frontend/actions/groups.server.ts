"use server";

import { CreateGroupFormData, AddUserToGroupFormData, AddUsersToGroupFormData } from "@/schemas/fe.schema";
import {
	CreateGroupRequest,
	CreateGroupClientResponse,
	AddUsersToGroupRequest,
	AddUsersToGroupResponse,
	AddUserToGroupRequest,
	AddUserToGroupResponse
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
	formData: AddUsersToGroupFormData,
	groupId: number,
): Promise<AddUsersToGroupResponse> {

	// console.log(formData);
	// convert the form data to the format expected by the backend
	const postData: AddUsersToGroupRequest = {
		groupId: groupId,
		usernames: formData.members,
	};


	try {
		const res = await fetch("http://127.0.0.1:8000/api/group/add_users/", {
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

export async function addUserToGroupAction(
	formData: AddUserToGroupFormData,
	groupId: number,
): Promise<AddUserToGroupResponse> {

	// console.log(formData);
	// convert the form data to the format expected by the backend
	const postData: AddUserToGroupRequest = {
		groupId: groupId,
		username: formData.members,
	};


	try {
		const res = await fetch("http://127.0.0.1:8000/api/group/add_user/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
			credentials: "include",
		});

		if (res.ok) {
			return {  message: "member added", success: true , status: res.status };
		} else {

			const data = await res.json();
			console.log("sign up backend error");
			// if an error occurred on the backend
			return {
				success: false,
				message: data.message,
				status: res.status
			};
		}
		// if an error occurred on the frontend
	} catch (error) {
		// if an error occurred on the backend
		console.log("createGroupAction", error);
		return {
			success: false,
			message: "A frontend error occurred during registration!",
			status: 500
		};
	}
}
