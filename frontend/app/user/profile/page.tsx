import PageLayout from "@/components/shared/PageLayout";
import ProfileFrame from "@/components/users/ProfileFrame";
import { UserDisplayData } from "@/schemas/fe.schema";
import { getCurrentSession } from "@/actions/users.server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
	// if user is not authenticated, redirect them to login
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData === null) {
		redirect("/user/login");
	}

	return (
		<PageLayout>
			<ProfileFrame userData={userData} />
		</PageLayout>
	);
}
