"use client";

import {withAuth} from "@/components/UserAuthCheck";
import PageLayout from "@/components/PageLayout";
import FetchUserData from "@/components/FetchUserData";

function ProfilePage() {
  const { userData, loading, error } = FetchUserData();
  if (loading) return <div>Loading...</div>;
  if (!userData) {
    return <div>Loading...</div>;
  }
  if (error) return <div>Error: {error}</div>;

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