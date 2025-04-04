"use client";
import {useRouter} from "next/navigation";
import {withAuth} from "@/components/UserAuthCheck";

function useLogout() {
	const router = useRouter();
	return () => {
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
		router.push("/user/login");
	};

}

function LogoutComponent(){
	const logout = useLogout();
  return (
<button
	onClick={logout}
	className="mt-2 bg-red-500 text-white font-semibold px-2 py-0.5 rounded-lg shadow hover:bg-red-600 transition"
> Log Out
</button>
  );
}

export default withAuth(LogoutComponent);