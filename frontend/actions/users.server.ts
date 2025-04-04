"use server";

import {
	RegisterUserFormData,
	LoginUserFormData,
	UserDisplayData,
} from "@/schemas/fe.schema";
import {
	RegisterUserClientResponse,
	LoginUserClientResponse,
	RegisterUserRequest,
	LoginUserRequest,
} from "@/schemas/transaction.schema";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";

export const getCurrentSession = async (): Promise<UserDisplayData | null> => {
	// test whether we can cache this
	// try to get the access token from the request cookies
	const cookieStore: ReadonlyRequestCookies = await cookies();
	// console.log(cookieStore);
	const token: string | null = cookieStore.get("access_token")?.value ?? null;

	// if token is null, return user is null
	if (token === null) {
		console.log("no token found");
		return null;
	}

	console.log("getting user data");
	// otherwise try to retrieve user data
	const response: Response = await fetch(
		"http://127.0.0.1:8000/api/get-current-user/",
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		},
	);
	// console.log(response);
	if (response.ok) {
		console.log("response ok");
		return await response.json();
	} else {
		return null;
	}
};

export async function registerUserAction(
	formData: RegisterUserFormData,
): Promise<RegisterUserClientResponse> {
	const postData: RegisterUserRequest = {
		username: formData.username,
		email: formData.email,
		password: formData.password,
	};
	try {
		const res = await fetch("http://127.0.0.1:8000/api/register/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
		});

		if (res.ok) {
			console.log("sign up ok");
			return { ok: true, message: "" };
		} else {
			console.log("sign up backend error");
			// if an error occurred on the backend
			return {
				ok: false,
				message: "A backend error occurred during registration!",
			};
		}
		// if an error occurred on the frontend
	} catch (error) {
		// if an error occurred on the backend
		console.log("sign up frontend error");
		return {
			ok: false,
			message: "A frontend error occurred during registration!",
		};
	}
}

export async function logoutUserAction(userData: UserDisplayData) {
	// invalidate sessions in the database
	// DOES THIS EXIST?

	// clear local cookies
	await deleteSessionTokenCookie();
}

export async function loginUserAction(
	formData: LoginUserFormData,
): Promise<LoginUserClientResponse> {
	const postData: LoginUserRequest = {
		username: formData.username,
		password: formData.password,
	};
	try {
		const res: Response = await fetch("http://127.0.0.1:8000/api/login/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
			credentials: "include",
		});

		if (res.ok) {
			console.log("login ok");

			const data = await res.json();

			const accessToken = data.access;
			const refreshToken = data.refresh;

			if (accessToken && refreshToken) {
				await setSessionTokenCookie(accessToken);
				console.log("Access token set.");
			} else {
				console.log("No access token or refresh token received.");
			}

			return { ok: true, message: "" };
		} else {
			console.log("login rejection - backend");
			// if an error occurred on the backend
			return {
				ok: false,
				message: "Incorrect username or password",
			};
		}
		// if an error occurred on the frontend
	} catch (error) {
		// if an error occurred on the backend
		console.log("login rejection - frontend");
		return {
			ok: false,
			message: "A server error occurred during login!",
		};
	}
}

export async function setSessionTokenCookie(
	token: string,
	// expiresAt: Date,
): Promise<void> {
	"use server";
	// get cookies from the browser and set the session token
	const cookieStore: ReadonlyRequestCookies = await cookies();
	cookieStore.set("access_token", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		// expires: expiresAt,
		path: "/",
	});
}

export async function deleteSessionTokenCookie(): Promise<void> {
	"use server";
	const cookieStore: ReadonlyRequestCookies = await cookies();
	cookieStore.set("access_token", "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
}
