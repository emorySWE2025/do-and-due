import NavFrame from "@/components/NavFrame";
import { JSX } from "react";

export default function PageLayout({
	children,
}: {
	children: JSX.Element | null;
}) {
	return (
		<div className="flex h-[100vh] w-[100vw] flex-col flex-nowrap">
			<div className="h-max w-full border-b-[1px] border-gray-300 p-4 shadow-sm">
				<NavFrame />
			</div>
			<div className="h-full w-full overflow-x-hidden overflow-y-auto">
				{children}
			</div>
		</div>
	);
}
