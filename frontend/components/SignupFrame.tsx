"use client";

import Input from "@/components/Input";
import Button from "@/components/Button";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
	registerUserAction,
	RegisterUserResponse,
} from "@/actions/users.server";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema } from "@/actions/zod";
import ErrorText from "@/components/ErrorText";

export default function SignupFrame() {
	return (
		<div className="m-auto h-full max-w-md space-y-8 py-12">
			<div className="text-center">
				<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
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
		console.log("Form submitted:", data);
		const response: RegisterUserResponse = await registerUserAction(data);
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
			{errors.root && <ErrorText message={errors.root.message} />}
		</form>
	);
}
