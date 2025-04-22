"use client";

import { deleteEventAction } from "@/actions/events.server";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";

export default function DeleteEventButton({ eventId }: { eventId: number }) {
	const router = useRouter();

	const handleDelete = async () => {
		const confirmed = window.confirm(
			"Are you sure you want to delete this event?",
		);
		if (!confirmed) return;

		await deleteEventAction(eventId);
		router.push("/events");
	};

	return <Button onClick={handleDelete}>Delete</Button>;
}
