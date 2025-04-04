"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserAuthCheck({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redirected, setRedirected] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // if a redirect has already occurred, not redirecting again
        if (redirected) return;

        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        if (!accessToken) {
            setLoading(false);
            router.push("/user/login");
            setRedirected(true);
            return;
        }

        fetch("http://127.0.0.1:8000/api/get-current-user/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) throw new Error("Not authenticated");
            return response.json();
        })
        .then(data => {
            console.log("User Data:", data);
            setUser(data);
            setLoading(false);
        })
        .catch(() => {
            console.error("Authentication failed");
            setLoading(false);
            router.push("/user/login");
            setRedirected(true);
        });
    }, [router, redirected]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
}
