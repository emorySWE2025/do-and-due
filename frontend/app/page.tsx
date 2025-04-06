import { getCurrentSession } from "@/actions/users.server";
import HomeFrame from "@/components/HomeFrame";
import PageLayout from "@/components/PageLayout";
import { UserDisplayData } from "@/schemas/fe.schema";
import { redirect } from "next/navigation";

const placeholderUser: UserDisplayData = {
	id: 1,
	username: "bea",
	email: "test@test.com",
	photoPath: "/profile-placeholder.png",
	groups: [
		{
			id: 101,
			name: "Home 🏠︎",
			members: ["bea", "vee"],
			events: [
				{
					name: "Vacuum the living room",
					date: "2025-03-26",
					completed: true,
				},
				{
					name: "Do the laundry",
					date: "2025-03-26",
					completed: true,
				},
				{
					name: "Wash the car",
					date: "2025-03-27",
					completed: true,
				},
				{
					name: "Take out recycling",
					date: "2025-03-27",
					completed: true,
				},
				{
					name: "Dust shelves and furniture",
					date: "2025-03-28",
					completed: true,
				},
				{
					name: "Mop the kitchen floor",
					date: "2025-03-28",
					completed: false,
				},
				{
					name: "Clean the cat's water fountain",
					date: "2025-03-29",
					completed: false,
				},
				{
					name: "Organize the pantry",
					date: "2025-03-29",
					completed: false,
				},
				{
					name: "Water the plants",
					date: "2025-03-30",
					completed: false,
				},
				{
					name: "Deep clean the bathroom",
					date: "2025-03-30",
					completed: false,
				},
				{
					name: "Change bed sheets",
					date: "2025-03-31",
					completed: false,
				},
			],
		},
		{
			id: 102,
			name: "Chicago Trip 🏙️",
			members: ["bea", "vee", "kaily", "tif"],
			events: [
				{
					name: "Take out the trash",
					date: "2025-03-29",
					completed: false,
				},
				{
					name: "Clean the kitchen",
					date: "2025-03-30",
					completed: false,
				},
				{
					name: "Wipe down bathroom counters",
					date: "2025-03-30",
					completed: false,
				},
				{
					name: "Sweep entryway",
					date: "2025-03-31",
					completed: false,
				},
				{
					name: "Pack up luggage",
					date: "2025-03-31",
					completed: false,
				},
				{
					name: "Clean AirBNB before checkout",
					date: "2025-04-01",
					completed: false,
				},
				{
					name: "Check for forgotten items",
					date: "2025-04-01",
					completed: false,
				},
			],
		},
	],
};

export default async function Home() {
	// if user is not authenticated, redirect them to login
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData === null) {
		redirect("/user/login");
	}

	return (
		<PageLayout>
			<HomeFrame userData={placeholderUser} />
		</PageLayout>
	);
}
