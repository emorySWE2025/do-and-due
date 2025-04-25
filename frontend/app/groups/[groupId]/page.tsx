

import { getCurrentSession } from "@/actions/users.server";
import PageLayout from "@/components/shared/PageLayout";
import { UserDisplayData } from "@/schemas/fe.schema";
import { redirect} from "next/navigation";
import AddMemberFrame from "@/components/groups-page/AddMemberFrame";

// Add params type for dynamic route
export default async function GroupsPage({
	params,
  }: {
	params: { groupId: string };
  }) {
	// Authentication check
	const userData: UserDisplayData | null = await getCurrentSession();
	if (!userData) redirect("/user/login");
  
	return (
	  <PageLayout>
		{/* Use actual groupId from URL params */}
		<AddMemberFrame groupId={Number(params.groupId)} groupMembers={userData.groups.find(group => group.id === Number(params.groupId))?.members}/>
	  </PageLayout>
	);
  }
