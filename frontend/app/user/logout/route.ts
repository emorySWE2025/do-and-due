import { getCurrentSession, logoutUserAction } from "@/actions/users.server";
import { UserDisplayData } from "@/schemas/fe.schema";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
	// // if user is not authenticated, redirect them to login
	// const userData: UserDisplayData | null = await getCurrentSession();
	// if (userData === null) {
	// 	redirect("/user/login");
	// } else {
	await logoutUserAction();
	console.log("logged out");
	redirect("/user/login");
	// }
}
