import { getCurrentSession } from "@/actions/users.server";
import PageLayout from "@/components/shared/PageLayout";
import { UserDisplayData } from "@/schemas/fe.schema";
import { redirect } from "next/navigation";

export default async function Home() {
	// this page should still be protected so any incorrect URLs for unauthenticated users are
	// redirected to login
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData === null) redirect("/user/login");

	return (
		<PageLayout>
			<div className="m-auto mt-16 h-max w-max max-w-xl space-y-4 rounded-lg border-[1px] border-gray-300 p-16 shadow-sm">
				<div className="flex flex-row flex-nowrap items-center">
					<div className="border-r-1 border-gray-300 pr-4 text-3xl">
						404
					</div>
					<div className="pl-4 text-xl">Page not found!</div>
				</div>
			</div>
		</PageLayout>
	);
}
