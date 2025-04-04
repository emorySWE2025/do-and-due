import SignupFrame from "@/components/SignupFrame";
import PageLayout from "@/components/PageLayout";
import { UserDisplayData } from "@/schemas/fe.schema";
import { getCurrentSession } from "@/actions/users.server";
import { redirect } from "next/navigation";

export default async function SignupPage() {
	// if user is already authenticated, redirect them to root
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData !== null) {
		redirect("/");
	}

	return (
		<PageLayout>
			<SignupFrame />
		</PageLayout>
	);
}
