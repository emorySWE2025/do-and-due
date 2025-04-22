"use client";

import { deleteEventAction } from "@/actions/events.server";
import Button from "@/components/shared/Button";

export default function DeleteEventButton({ eventId }: { eventId: number }) {
	const handleDelete = async () => {
		const confirmed = window.confirm(
			"Are you sure you want to delete this event?",
		);

		if (confirmed) {
			await deleteEventAction(eventId);
			window.location.href = "/events";
		}
	};

	return <Button onClick={handleDelete}>Delete</Button>;
}
