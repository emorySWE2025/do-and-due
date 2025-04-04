import { getCurrentSession } from "@/actions/users.server";
import LoginFrame from "@/components/LoginFrame";
import PageLayout from "@/components/PageLayout";
import { UserDisplayData } from "@/schemas/fe.schema";
import { redirect } from "next/navigation";

export default async function LoginPage() {
	// if user is not authenticated, redirect them to login
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData !== null) {
		redirect("/");
	}

	return (
		<PageLayout>
			<LoginFrame />
		</PageLayout>
	);
}
