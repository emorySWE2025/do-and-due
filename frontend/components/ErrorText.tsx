export default function ErrorText({
	message,
}: {
	message: string | undefined;
}) {
	return <p className="mt-2 text-center text-sm text-red-500">{message}</p>;
}
