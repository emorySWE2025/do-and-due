"use server";

import { CreateEventFormData, GroupDisplayData } from "@/schemas/fe.schema";
import {
	CreateEventClientResponse,
	CreateEventRequest,
	MarkEventCompleteRequest,
} from "@/schemas/transaction.schema";

// export function createEventAction() {}

export async function setEventStatusAction(
	eventId: number,
	eventIsComplete: boolean,
) {
	const postData: MarkEventCompleteRequest = {
		eventId: eventId,
		eventIsComplete: eventIsComplete,
	};
	try {
		const res = await fetch("http://127.0.0.1:8000/api/event/complete/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
			credentials: "include",
		});
		console.log();
		const data = await res.json();

		if (data.success) {
			console.log("status set ok");
			return data;
		} else {
			console.log("status setting error");
			// if an error occurred on the backend
			return data;
		}
	} catch (error) {
		console.log("setEventStatusAction", error);
		return {
			ok: false,
			message: "A frontend error occurred!",
		};
	}
}

export async function createEventAction(
	formData: CreateEventFormData,
	groupData: GroupDisplayData,
): Promise<CreateEventClientResponse> {
	// convert the form data to the format expected by the backend
	const postData: CreateEventRequest = {
		name: formData.name,
		date: formData.date,
		repeatEvery: formData.repeats !== "None" ? formData.repeats : undefined,
		memberNames: formData.members.split(" "),
		groupId: groupData.id,
	};
	console.log(postData);

	try {
		const res = await fetch("http://127.0.0.1:8000/api/event/create/", {
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
				message: "A backend error occurred during creation!",
			};
		}
	} catch (error) {
		// if an error occurred on the frontend
		console.log("createEventAction", error);
		return {
			ok: false,
			message: "A frontend error occurred during creation!",
		};
	}
}

export async function updateEventAction(
	formData: CreateEventFormData & { id: number },
): Promise<{ ok: boolean; message: string }> {
	const putData = {
		name: formData.name,
		first_date: formData.date,
		repeat_every:
			formData.repeats !== "None" ? formData.repeats : undefined,
	};

	try {
		const res = await fetch(
			`http://127.0.0.1:8000/api/event/update/${formData.id}/`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(putData),
				credentials: "include",
			},
		);

		if (res.ok) {
			return { ok: true, message: "Event updated" };
		} else {
			return { ok: false, message: "Backend error during update" };
		}
	} catch (error) {
		console.error("updateEventAction error:", error);
		return { ok: false, message: "Frontend error during update" };
	}
}

export async function deleteEventAction(
	eventId: number,
): Promise<{ ok: boolean; message: string }> {
	try {
		const res = await fetch(
			`http://127.0.0.1:8000/api/event/delete/${eventId}/`,
			{
				method: "DELETE",
				credentials: "include",
			},
		);

		if (res.ok) {
			return { ok: true, message: "Event deleted" };
		} else {
			return { ok: false, message: "Backend error during deletion" };
		}
	} catch (error) {
		console.error("deleteEventAction error:", error);
		return { ok: false, message: "Frontend error during deletion" };
	}
}

export async function viewEventAction(eventId: number): Promise<{
	ok: boolean;
	message: string;
	event?: {
		id: number;
		name: string;
		first_date: string;
		repeat_every: string | null;
		is_complete: boolean;
		group: { id: number; name: string };
		members: string[];
	};
}> {
	try {
		const res = await fetch(
			`http://127.0.0.1:8000/api/event/view/${eventId}/`,
			{
				method: "GET",
				credentials: "include",
			},
		);

		if (res.ok) {
			const json = await res.json();
			return { ok: true, message: "", event: json.event };
		} else {
			return { ok: false, message: "Backend error while fetching event" };
		}
	} catch (error) {
		console.error("viewEventAction error:", error);
		return { ok: false, message: "Frontend error while fetching event" };
	}
}
