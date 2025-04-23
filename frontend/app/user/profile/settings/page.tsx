import PageLayout from "@/components/shared/PageLayout";
import { UserDisplayData } from "@/schemas/fe.schema";
import { getCurrentSession } from "@/actions/users.server";
import { redirect } from "next/navigation";
import SettingsFrame from "@/components/users/SettingsFrame";

export default async function SettingsPage() {
	// if user is not authenticated, redirect them to login
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData === null) {
		redirect("/user/login");
	}

	return (
		<PageLayout>
			<SettingsFrame userData={userData} />
		</PageLayout>
	);
}
