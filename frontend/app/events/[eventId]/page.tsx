import { redirect } from "next/navigation";
import { getCurrentSession } from "@/actions/users.server";

import PageLayout from "@/components/shared/PageLayout";
import { notFound } from "next/navigation";
import { updateEventAction, viewEventAction } from "@/actions/events.server";
import Button from "@/components/shared/Button";
import DeleteEventButton from "@/components/events-page/DeleteEventButton";

export default async function EventPage({
	params,
}: {
	params: Promise<{ eventId: string }>;
}) {
	const userData = await getCurrentSession();
	if (!userData) redirect("/user/login");

	const { eventId } = await params;

	const { ok, event } = await viewEventAction(Number(eventId));
	if (!ok || !event) notFound();

	return (
		<PageLayout>
			<form
				action={async (formData) => {
					"use server";
					const updated = {
						id: event.id,
						name: formData.get("name") as string,
						date: formData.get("first_date") as string,
						repeats: formData.get("repeat_every") as string,
						is_complete: formData.get("is_complete") === "on",
						members: event.members.join(" "),
					};
					await updateEventAction(updated);

					// refresh page once event has been updated
					redirect(`/events/${event.id}`);
				}}
			>
				<div className="m-auto mt-16 h-max w-full max-w-xl space-y-4 rounded-lg border-[1px] border-gray-300 p-16 shadow-sm">
					<h2 className="text-3xl font-bold">Edit Event</h2>

					<div className="space-y-4">
						<div>
							<label className="font-semibold">Name</label>
							<input
								type="text"
								name="name"
								defaultValue={event.name}
								className="w-full rounded border border-gray-300 px-2 py-1"
							/>
						</div>

						<div>
							<label className="font-semibold">Date</label>
							<input
								type="date"
								name="first_date"
								defaultValue={event.first_date}
								className="w-full rounded border border-gray-300 px-2 py-1"
							/>
						</div>

						<div>
							<label className="font-semibold">
								Repeat Every
							</label>
							<input
								type="text"
								name="repeat_every"
								defaultValue={event.repeat_every ?? ""}
								className="w-full rounded border border-gray-300 px-2 py-1"
							/>
						</div>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								name="is_complete"
								defaultChecked={event.is_complete}
							/>
							<label className="font-semibold">Completed</label>
						</div>
					</div>

					<div className="mt-8 flex justify-between">
						<Button type="submit">Save Changes</Button>
						<DeleteEventButton eventId={event.id} />
					</div>
				</div>
			</form>
		</PageLayout>
	);
}
