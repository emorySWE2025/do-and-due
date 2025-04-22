"use client";

import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { registerUserAction } from "@/actions/users.server";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema } from "@/actions/zod";
import { ErrorText, ErrorPopup } from "@/components/shared/Errors";
import { RegisterUserClientResponse } from "@/schemas/transaction.schema";

export default function SignupFrame() {
	return (
		<div className="m-auto h-max w-full max-w-lg space-y-8 rounded-2xl border-[1px] border-gray-300 p-16 shadow-sm">
			<div className="text-center">
				<h2 className="text-3xl font-extrabold text-gray-900">
					Create an account
				</h2>
			</div>
			<SignupForm />
			<div className="text-center">
				<Link
					href="/user/login"
					className="font-medium text-purple-600 hover:text-purple-500"
				>
					Already have an account? Log in
				</Link>
			</div>
		</div>
	);
}

function SignupForm() {
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm({ resolver: zodResolver(registerUserSchema) });

	const onSubmit = async (data: any) => {
		const response: RegisterUserClientResponse =
			await registerUserAction(data);
		if (!response.ok) {
			console.log(response.message);
			// if the response wasn't ok, the error message will be stored at response.message
			setError("root", { message: response.message });
		} else {
			// if response was ok, redirect to login
			redirect("/user/login");
		}
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
				<Input type="text" {...register("email")} label="Email" />
				{errors.email && <ErrorText message={errors.email.message} />}
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

			<div>
				<Input
					type="password"
					{...register("confirmPassword")}
					label="Confirm Password"
				/>
				{errors.confirmPassword && (
					<ErrorText message={errors.confirmPassword.message} />
				)}
			</div>

			<Button className="w-full" type="submit" disabled={isSubmitting}>
				Submit
			</Button>
		</form>
	);
}
