"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GroupDisplayData } from "@/schemas/fe.schema";
import Button from "../shared/Button";
import { toast } from 'react-toastify';
import { LeaveGroupClientResponse } from "@/schemas/transaction.schema";

const GroupCard = ({
  groupData,
  onView,
  showDeleteButton = false,
  onDelete,
}: {
  groupData: GroupDisplayData;
  onView: () => void;
  showDeleteButton?: boolean;
  onDelete: () => Promise<LeaveGroupClientResponse>;
}) => {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setError(null);
    setSuccess(null);

    if (window.confirm("Are you sure you want to leave this group?")) {
      setIsDeleting(true);

      try {
        const result = await onDelete();

        if (result.ok) {
          toast.success("You have left the group")
          setSuccess(result.message);
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error((`Error: ${result.message}`))
          setError(result.message);
        }
      } catch (err) {
        toast.error((`Error: Failed to leave this group`))
        setError("Failed to leave group");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="min-w-80 rounded-md border-1 border-gray-300 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {groupData.name}
        </h2>
        <div className="text-gray-400">
          <button className="p-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ... existing svg paths ... */}
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        {showDeleteButton && (
          <Button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={isDeleting || !!success}
          >
            {isDeleting ? "Leaving..." : success ? "✓ Left" : "Leave"}
          </Button>
        )}
        <Link href={`/groups/${groupData.id}`} passHref>
          <Button onClick={onView}>View</Button>
        </Link>
      </div>

      
    </div>
  );
};

export default GroupCard;