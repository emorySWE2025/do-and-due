"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import PasswordRequirements from "@/components/PasswordReqs";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
					href="/login"
					className="font-medium text-purple-600 hover:text-purple-500"
				>
					Already have an account? Log in
				</Link>
			</div>
		</div>
	);
}

function SignupForm() {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
	});

	const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const router = useRouter();

	const validatePassword = (password: string) => {
		const errors: string[] = [];
		if (password.length < 8) errors.push("Must be at least 8 characters");
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			errors.push("Must contain one special character");
		}
		setPasswordErrors(errors);
		return errors.length === 0;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		if (name === "password") {
			validatePassword(value);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validatePassword(formData.password)) {
			console.log("Invalid password");
			return;
		}

		try {
			const res = await fetch("http://127.0.0.1:8000/api/register/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: formData.username,
					email: formData.email,
					password: formData.password,
				}),
			});
			if (!res.ok) {
				const errorData = await res.json();
				alert(`Signup Error: ${errorData.error}`);
				setErrorMessage(errorData.error || "Signup failed");
			}

			if (res.ok) {
				console.log("Signup successful");

				const loginRes = await fetch(
					"http://127.0.0.1:8000/api/login/",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify({
							username: formData.username,
							password: formData.password,
						}),
					},
				);

				if (loginRes.ok) {
					console.log("Login successful");
					router.push("/");
				} else {
					const errorData = await loginRes.json();
					setErrorMessage(
						errorData.error || "Login failed after signup",
					);
				}
			} else {
				const errorData = await res.json();
				setErrorMessage(errorData.error || "Signup failed");
			}
		} catch (error) {
			console.error("Error:", error);
			setErrorMessage("An unexpected error occurred");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{errorMessage && <div className="text-red-500">{errorMessage}</div>}

			<Input
				type="text"
				name="username"
				label="Username"
				placeholder="Enter your username"
				value={formData.username}
				onChange={handleChange}
				required
			/>
			<Input
				type="email"
				name="email"
				label="Email"
				placeholder="Enter your email"
				value={formData.email}
				onChange={handleChange}
				required
			/>
			<div>
				<Input
					type="password"
					name="password"
					label="Password"
					placeholder="Create a password"
					value={formData.password}
					onChange={handleChange}
					required
				/>
				<PasswordRequirements errors={passwordErrors} />
			</div>
			<Button
				type="submit"
				className="w-full"
				disabled={passwordErrors.length > 0}
			>
				Get started
			</Button>
		</form>
	);
}
