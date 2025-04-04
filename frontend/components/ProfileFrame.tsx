import { UserDisplayData } from "@/schemas/fe.schema";

export default function ProfileFrame({
	userData,
}: {
	userData: UserDisplayData;
}) {
	return (
		<div className="m-auto h-full w-full pt-16 text-center">
			<h2 className="mb-4 text-3xl font-bold">Profile</h2>
			<p className="text-xl">Username: {userData.username}</p>
			<p className="text-xl">Email: {userData.email}</p>
			<h3 className="mt-4 text-2xl">Groups:</h3>
			<ul>
				{userData.groups.length > 0 ? (
					userData.groups.map((group, index) => (
						<li key={index} className="text-lg">
							{group.name}
						</li>
					))
				) : (
					<p>No groups found</p>
				)}
			</ul>
		</div>
	);
}
