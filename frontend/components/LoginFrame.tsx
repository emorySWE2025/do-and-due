"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
					href="/signup"
					className="font-medium text-purple-600 hover:text-purple-500"
				>
					Don't have an account? Sign up
				</Link>
			</div>
		</div>
	);
}

function LoginForm() {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
		rememberMe: false,
	});
	const [, setErrorMessage] = useState<string | null>(null);
	const router = useRouter();
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, type, value, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await fetch("http://127.0.0.1:8000/api/login/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: formData.username.toLowerCase(),
					password: formData.password,
				}),
				credentials: "include",
			});
			if (response.ok) {
				router.push("/");
				console.log("Login submitted", formData);
			} else {
				const errorData = await response.json();
				setErrorMessage(
					errorData.error || "Login failed. Please try again.",
				);
				alert("Login failed. Please try again.");
			}
		} catch (error) {
			setErrorMessage("An error occurred, please try again");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Input
				type="username"
				name="username"
				label="Username"
				placeholder="Enter your username"
				value={formData.username}
				onChange={handleChange}
				required
			/>
			<Input
				type="password"
				name="password"
				label="Password"
				placeholder="Enter your password"
				value={formData.password}
				onChange={handleChange}
				required
			/>
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					<input
						type="checkbox"
						name="rememberMe"
						id="rememberMe"
						checked={formData.rememberMe}
						onChange={handleChange}
						className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
					/>
					<label
						htmlFor="rememberMe"
						className="ml-2 block text-sm text-gray-900"
					>
						Remember for 30 days
					</label>
				</div>
				<div className="text-sm">
					<Link
						href="/forgot-password"
						className="font-medium text-purple-600 hover:text-purple-500"
					>
						Forgot password
					</Link>
				</div>
			</div>
			<Button type="submit" className="w-full">
				Sign in
			</Button>
		</form>
	);
}
