import { getCurrentSession } from "@/actions/users.server";
import PageLayout from "@/components/PageLayout";
import { UserDisplayData } from "@/schemas/fe.schema";
import { redirect } from "next/navigation";
import AddMemberFrame from "@/components/AddMemberFrame";

export default async function GroupsPage() {
	// if user is not authenticated, redirect them to login
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData === null) {
		redirect("/user/login");
	}

	return (
		<PageLayout>
			 <AddMemberFrame groupId={1}/>
		</PageLayout>
	);
}
