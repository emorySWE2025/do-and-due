// "use client";

// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import type { ComponentType } from "react";

// export function withAuth<P extends object>(
// 	WrappedComponent: ComponentType<P>,
// ): ComponentType<P> {
// 	return function AuthenticatedComponent(props: P) {
// 		// for redirecting users
// 		const router = useRouter();
// 		// shows a loading screen while we're validating the tokens
// 		const [loading, setLoading] = useState(true);
// 		// check whether the user is logged in or not
// 		const [isAuthenticated, setIsAuthenticated] = useState(false);

// 		// grabs an access token and validates user, else if invalid/expired token, redirects to login page
// 		useEffect(() => {
// 			const accessToken = localStorage.getItem("access_token");

// 			if (!accessToken) {
// 				router.push("/user/login");
// 				return;
// 			}
// 			console.log("here");
// 			fetch("http://127.0.0.1:8000/api/get-current-user/", {
// 				headers: {
// 					Authorization: `Bearer ${accessToken}`,
// 					"Content-Type": "application/json",
// 				},
// 				credentials: "include",
// 			})
// 				.then((res) => {
// 					if (!res.ok) throw new Error("Unauthenticated");
// 					return res.json();
// 				})
// 				.then(() => {
// 					setIsAuthenticated(true);
// 					setLoading(false);
// 				})
// 				.catch(() => {
// 					router.push("/user/login");
// 				});
// 		}, [router]);

// 		// updates while token is being validated
// 		if (loading) {
// 			console.log("validating credentials");
// 		}

// 		if (!isAuthenticated) {
// 			return null;
// 		}

// 		// if token is valid, render the original page we wrapped
// 		return <WrappedComponent {...props} />;
// 	};
// }
