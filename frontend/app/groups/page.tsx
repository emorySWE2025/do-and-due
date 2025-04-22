import { getCurrentSession } from "@/actions/users.server";
import PageLayout from "@/components/shared/PageLayout";
import { UserDisplayData } from "@/schemas/fe.schema";
import { redirect } from "next/navigation";
import GroupsFrame from "@/components/groups-page/GroupsFrame";

export default async function GroupsPage() {
	// if user is not authenticated, redirect them to login
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData === null) {
		redirect("/user/login");
	}

	return (
		<PageLayout>
			<GroupsFrame GroupsData={userData.groups} />
		</PageLayout>
	);
}
