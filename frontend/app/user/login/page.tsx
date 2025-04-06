import LoginFrame from "@/components/LoginFrame";
import { getCurrentSession } from "@/actions/users.server";
import { UserDisplayData } from "@/schemas/fe.schema";
import { redirect } from "next/navigation";

export default async function LoginPage() {
	// if user is already authenticated, redirect them to root
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData !== null) {
		redirect("/");
	}

	return (
		<div className="flex h-[100vh] w-[100vw]">
			<LoginFrame />
		</div>
	);
}
