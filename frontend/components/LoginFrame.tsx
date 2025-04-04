"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Error from "@/components/Error";
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
          href="/user/signup"
          className="font-medium text-purple-600 hover:text-purple-500"
        >
          Don&#39;t have an account? Sign up
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const dismissError = () => setErrorMessage("");
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
      const data = await response.json();

      const accessToken = data.access;
      const refreshToken = data.refresh

      if (accessToken && refreshToken) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        console.log("Login successful");
        router.push("/");
      } else {
        setErrorMessage("No access token or refresh token received.");
      }
    } else {
      const errorData = await response.json();
      setErrorMessage(
        errorData.error || "Login failed. Please try again."
      );
    }
  } catch (error) {
    console.error("Error logging in:", error);
    setErrorMessage("An error occurred. Please try again later.");
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Error message={errorMessage} onClose={dismissError} />
      )}
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
      <div className="items-center">
        <div className="float-right mb-3 text-sm">
          <Link
            href="/user/forgot-password"
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
