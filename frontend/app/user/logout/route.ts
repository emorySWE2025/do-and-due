import { logoutUserAction } from "@/actions/users.server";
import { redirect } from "next/navigation";

export async function GET() {
	await logoutUserAction().then(() => {
		console.log("logged out");
		redirect("/");
	});
}
