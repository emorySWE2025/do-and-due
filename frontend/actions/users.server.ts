"use server";

import { SafeParseReturnType } from "zod";

import { cookies } from "next/headers";
import { cache } from "react";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { registerUserSchema } from "@/actions/zod";
import { RegisterUserFormData, LoginUserFormData } from "@/schemas/fe.schema";
import {
	RegisterUserClientResponse,
	LoginUserClientResponse,
} from "@/schemas/transaction.schema";

export async function registerUserAction(
	formData: RegisterUserFormData,
): Promise<RegisterUserClientResponse> {
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

export async function loginUserAction(
	formData: LoginUserFormData,
): Promise<LoginUserClientResponse> {
	try {
		const res = await fetch("http://127.0.0.1:8000/api/login/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: formData.username,
				password: formData.password,
			}),
			credentials: "include",
		});

		if (res.ok) {
			console.log("login ok");
			return { ok: true, message: "" };
		} else {
			console.log("login backend error");
			// if an error occurred on the backend
			return {
				ok: false,
				message: "A backend error occurred during login!",
			};
		}
		// if an error occurred on the frontend
	} catch (error) {
		// if an error occurred on the backend
		console.log("login frontend error");
		return {
			ok: false,
			message: "A frontend error occurred during login!",
		};
	}
}

// export const getCurrentSession = cache(
// 	// cache the results of the session cookie retrieval so we don't need to
// 	// repeatedly query the database
// 	async (): Promise<SessionValidationResult> => {
// 		const cookieStore: ReadonlyRequestCookies = await cookies();
// 		const token: string | null = cookieStore.get("session")?.value ?? null;
// 		if (token === null) {
// 			return { session: null, user: null };
// 		}
// 		const result: SessionValidationResult =
// 			await validateSessionToken(token);
// 		return result;
// 	},
// );

// export async function validateUserAction(
// 	prevState: PageState | void,
// 	formData: FormData,
// ): Promise<PageState | void> {
// 	"use server";
// 	// validate form data with zod
// 	const result: SafeParseReturnType<LoginFormData, LoginFormData> =
// 		await loginSchema.safeParseAsync(Object.fromEntries(formData));
// 	console.log(result);
// 	// return any zod errors
// 	if (!result.success) {
// 		return {
// 			message:
// 				result.error.issues[0] != null
// 					? result.error.issues[0].message
// 					: "An unknown error occured!",
// 		};
// 	}

// 	// destructure credentials output
// 	const { username, password } = result.data;

// 	// validate credentials in db
// 	const user: User | null = await validateCredentials(username, password);
// 	if (user !== null) {
// 		await handleSessionLogIn(user.id);
// 	} else {
// 		return { message: "Invalid credentials!" };
// 	}
// }

// async function validateCredentials(
// 	username: string,
// 	password: string,
// ): Promise<User | null> {
// 	try {
// 		// search for the user in the db
// 		const user: User | null = await _findUser(username);

// 		// if they exist, return the user if their password is correct
// 		// otherwise return null
// 		if (user !== null) {
// 			const userValidated: boolean = await bcrypt.compare(
// 				password,
// 				user?.hash,
// 			);
// 			return userValidated ? user : null;
// 		} else {
// 			return null;
// 		}
// 	} catch {
// 		return null;
// 	}
// }
