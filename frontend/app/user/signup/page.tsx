import SignupFrame from "@/components/SignupFrame";
import PageLayout from "@/components/PageLayout";
import { UserDisplayData } from "@/schemas/fe.schema";
import { getCurrentSession } from "@/actions/users.server";
import { redirect } from "next/navigation";

export default async function SignupPage() {
	// if user is not authenticated, redirect them to login
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData === null) {
		redirect("/user/login");
	}

	return (
		<PageLayout>
			<SignupFrame />
		</PageLayout>
	);
}
