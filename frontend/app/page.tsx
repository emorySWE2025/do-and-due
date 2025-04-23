import { getCurrentSession } from "@/actions/users.server";
import HomeFrame from "@/components/home-page/HomeFrame";
import PageLayout from "@/components/shared/PageLayout";
import { GroupDisplayData, UserDisplayData } from "@/schemas/fe.schema";
import { redirect } from "next/navigation";

export default async function Home() {
	// if user is not authenticated, redirect them to login
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData === null) {
		redirect("/user/login");
	}

	return (
		<PageLayout>
			<HomeFrame userData={userData} />
		</PageLayout>
	);
}
