import { createGroupAction } from "@/actions/groups.server";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { CreateGroupClientResponse } from "@/schemas/transaction.schema";
import { createGroupSchema } from "@/actions/zod";
import { ErrorText } from "@/components/shared/Errors";
import { CreateGroupFormData } from "@/schemas/fe.schema";

export default function CreateGroupFrame({ userId }: { userId: number }) {
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
			<CreateGroupForm userId={userId} />
		</div>
	);
}

function CreateGroupForm({ userId }: { userId: number }) {
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm({ resolver: zodResolver(createGroupSchema) });
	const router = useRouter();

	const onSubmit = async (data: CreateGroupFormData) => {
		console.log("Form submitted:", data);
		const response: CreateGroupClientResponse = await createGroupAction(
			data,
			userId,
		);
		if (!response.ok) {
			console.log(response.message);
			// if the response wasn't ok, the error message will be stored at response.message
			setError("root", { message: response.message });
		} else {
			// if response was ok, refresh page
			router.refresh();
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div>
				<Input
					type="text"
					{...register("groupName")}
					label="Group Name"
				/>
				{errors.groupName && (
					<ErrorText message={errors.groupName.message} />
				)}
			</div>

			<Button className="w-full" type="submit" disabled={isSubmitting}>
				Submit
			</Button>

			{errors.root && <ErrorText message={errors.root.message} />}
		</form>
	);
}
