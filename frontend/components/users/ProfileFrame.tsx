import { UserDisplayData } from "@/schemas/fe.schema";
import Image from "next/image";
import Button from "@/components/shared/Button";
import Link from "next/link";

export default function ProfileFrame({
	userData,
}: {
	userData: UserDisplayData;
}) {
	return (
		<div className="m-auto mt-16 h-max w-full max-w-xl space-y-4 rounded-lg border-[1px] border-gray-300 p-16 shadow-sm">
			<h2 className="text-3xl font-bold">Profile</h2>
			<div className="flex flex-row flex-nowrap items-center justify-between">
				<div className="flex flex-col flex-nowrap gap-4">
					<div className="flex flex-row flex-nowrap items-center gap-2">
						<div className="font-semibold">Username: </div>
						<div className="text-gray-600">{userData.username}</div>
					</div>
					<div className="flex flex-row flex-nowrap items-center gap-2">
						<div className="font-semibold">Email: </div>
						<div className="text-gray-600">{userData.email}</div>
					</div>
				</div>
				<div className="">
					<Image
						src="/profile-placeholder.png"
						alt="Profile"
						width={96}
						height={96}
						className="rounded-[50%] object-cover"
					/>
				</div>
			</div>
			<div className="font-semibold">Groups:</div>
			<ul>
				{userData.groups.length > 0 ? (
					userData.groups.map((group, index) => (
						<li key={index} className="text-lg">
							{group.name}
						</li>
					))
				) : (
					<div className="text-gray-600">No groups found</div>
				)}
			</ul>
			<Link href={"/user/logout"} className="mt-12 block">
				<Button className="w-full">Log Out</Button>
			</Link>
		</div>
	);
}
