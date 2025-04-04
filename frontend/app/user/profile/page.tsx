"use client";

import { useState, useEffect } from "react";
import {withAuth} from "@/components/UserAuthCheck";
import PageLayout from "@/components/PageLayout";
import { UserDisplayData } from "@/schema";

function ProfilePage() {
  const [userData, setUserData] = useState<UserDisplayData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      try {
        const response = await fetch("http://127.0.0.1:8000/api/get-current-user/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
      <PageLayout>
        <div className="m-auto h-full w-full pt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Profile</h2>
          <p className="text-xl">Username: {userData.username}</p>
          <p className="text-xl">Email: {userData.email}</p>
          <h3 className="text-2xl mt-4">Groups:</h3>
          <ul>
            {userData.groups.length > 0 ? (
              userData.groups.map((group, index) => (
                <li key={index} className="text-lg">
                  {group.name}
                </li>
              ))
            ) : (
              <p>No groups found</p>
            )}
          </ul>
        </div>
      </PageLayout>
  );
}
export default withAuth(ProfilePage)