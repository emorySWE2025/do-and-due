import { getCurrentSession } from "@/actions/users.server";
import PageLayout from "@/components/PageLayout";
import { UserDisplayData } from "@/schemas/fe.schema";
import { redirect } from "next/navigation";

export default async function GroupsPage() {
	// if user is not authenticated, redirect them to login
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData === null) {
		redirect("/user/login");
	}

	return (
		<PageLayout>
			<div className="m-auto h-full w-full pt-16 text-center">
				[group info here]
			</div>
		</PageLayout>
	);
}
