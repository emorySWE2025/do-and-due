import PageLayout from "@/components/PageLayout";

export default function LoginPage() {
	// placeholder page here, this should send a request to the logout api route
	return (
		<PageLayout>
			<div className="m-auto h-full w-full cursor-progress pt-16 text-center text-purple-600">
				Logging you out...
			</div>
		</PageLayout>
	);
}
