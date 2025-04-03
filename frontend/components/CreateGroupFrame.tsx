import { createGroupAction } from "@/actions/groups";
import { PageState } from "@/schema";
import Form from "next/form";
import { useActionState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
// import { motion } from "motion/react";

export default function CreateGroupFrame() {
	return (
		<div className="m-auto h-max max-w-md space-y-8">
			<div className="text-center">
				<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
					Create a new group
				</h2>
				<p className="mt-2 text-sm text-gray-600">
					Enter details for your new group below!
				</p>
			</div>
			<CreateGroupForm pageState={undefined} />
		</div>
	);
}

function CreateGroupForm({ pageState }: { pageState: PageState | void }) {
	const [state, createGroup, pending] = useActionState(
		createGroupAction,
		pageState,
	);
	return (
		<Form action={createGroup} className="space-y-6">
			<Input
				type="text"
				name="groupname"
				label="Group Name"
				placeholder="really cool group"
			/>
			<Input type="text" name="members" label="Members" />
			<p className="text-center text-lg">{state?.message}</p>
			<Button className="w-full" type="submit" disabled={pending}>
				Submit
			</Button>
		</Form>
	);
}
