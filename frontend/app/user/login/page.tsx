import { getCurrentSession } from "@/actions/users.server";
import LoginFrame from "@/components/LoginFrame";
import { UserDisplayData } from "@/schemas/fe.schema";
import { redirect } from "next/navigation";

export default async function LoginPage() {
	// if user is already authenticated, redirect them to root
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData !== null) {
		redirect("/");
	}

	return (
			<LoginFrame />
	);
}
