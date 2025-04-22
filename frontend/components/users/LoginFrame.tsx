"use client";

import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorText, ErrorPopup } from "@/components/shared/Errors";
import { loginUserAction } from "@/actions/users.server";
import { loginUserSchema } from "@/actions/zod";
import { LoginUserClientResponse } from "@/schemas/transaction.schema";
import { useRouter } from "next/navigation";

export default function LoginFrame() {
	return (
		<div className="m-auto h-max w-full max-w-lg space-y-8 rounded-2xl border-[1px] border-gray-300 p-16 shadow-sm">
			<div className="text-center">
				<h2 className="text-3xl font-extrabold text-gray-900">
					Log in to your account
				</h2>
				<p className="mt-2 text-sm text-gray-600">
					Welcome back! Please enter your details.
				</p>
			</div>
			<LoginForm />
			<div className="text-center">
				<Link
					href="/user/signup"
					className="font-medium text-purple-600 hover:text-purple-500"
				>
					Do not have an account? Sign up
				</Link>
			</div>
		</div>
	);
}

function LoginForm() {
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm({ resolver: zodResolver(loginUserSchema) });
	const router = useRouter();

	const onSubmit = async (data: any) => {
		await loginUserAction(data).then(
			async (response: LoginUserClientResponse) => {
				if (!response.ok) {
					console.log(response.message);
					// if the response wasn't ok, the error message will be stored at response.message
					setError("root", { message: response.message });
				} else {
					router.push("/");
				}
			},
		);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{errors.root && <ErrorPopup message={errors.root.message} />}
			<div>
				<Input type="text" {...register("username")} label="Username" />
				{errors.username && (
					<ErrorText message={errors.username.message} />
				)}
			</div>
			<div>
				<Input
					type="password"
					{...register("password")}
					label="Password"
				/>
				{errors.password && (
					<ErrorText message={errors.password.message} />
				)}
			</div>

			<Button className="w-full" type="submit" disabled={isSubmitting}>
				Submit
			</Button>
		</form>
	);
}
