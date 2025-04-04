"use client";

import { useState, useEffect } from 'react';
import { UserDisplayData } from "@/schemas/fe.schema";  // Adjust import path if needed

function FetchUserData(){
    const [userData, setUserData] = useState<UserDisplayData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserDataBE = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        setLoading(false);
        return;
      }

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
          setError("Failed to fetch user data");
        }
      } catch (error) {
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataBE();
  }, []);

  return { userData, loading, error };
}

export default FetchUserData;
