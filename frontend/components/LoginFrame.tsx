"use client";

import Input from "@/components/Input";
import Button from "@/components/Button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorText from "@/components/ErrorText";
import { loginUserAction } from "@/actions/users.server";
import { loginUserSchema } from "@/actions/zod";
import { LoginUserResponse } from "@/schemas/transaction.schema";

export default function LoginFrame() {
	return (
		<div className="m-auto h-full max-w-md space-y-8 py-12">
			<div className="text-center">
				<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
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

	const onSubmit = async (data: any) => {
		console.log("Form submitted:", data);
		const response: LoginUserResponse = await loginUserAction(data);
		if (!response.ok) {
			console.log(response.message);
			// if the response wasn't ok, the error message will be stored at response.message
			setError("root", { message: response.message });
		} else {
			// if response was ok, redirect to root
			redirect("/");
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
			{errors.root && <ErrorText message={errors.root.message} />}
		</form>
	);
}
