"use server";

import { CreateGroupFormData } from "@/schemas/fe.schema";
import {
	CreateGroupRequest,
	CreateGroupClientResponse,
} from "@/schemas/transaction.schema";

// this file will contain server actions for the frontend
// export async function createGroupAction() {}

// export interface CreateGroupRequest {
// 	// fe > be
// 	// params necessary to create a group in the backend
// 	groupName: string;
// 	groupStatus: string;
// 	groupExpiration: string | null;
// 	groupTimezone: string;
// 	// groupCreator: User; // not sure if we should send an actual object here or just a username/id?
// 	groupCreatorId: number;
// }

export async function createGroupAction(
	formData: CreateGroupFormData,
	creatorId: number,
): Promise<CreateGroupClientResponse> {
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
		console.log("sign up frontend error");
		return {
			ok: false,
			message: "A frontend error occurred during registration!",
		};
	}
}
