"use client";

import React from 'react';
import Link from 'next/link';
import { GroupDisplayData } from '@/schemas/fe.schema';

const GroupCard = ({ groupData, onView }: { groupData: GroupDisplayData; onView: () => void }) => {
  return (
    <div className="rounded-3xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{groupData.name}</h2>
        <div className="text-gray-400">
          <button className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" />
              <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="currentColor" />
              <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Link href={`/groups/${groupData.id}`} passHref>
          <button 
            onClick={onView}
            className="rounded-2xl border border-gray-200 px-8 py-3 text-xl font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Add member
          </button>
        </Link>
      </div>
    </div>
  );
};

export default GroupCard;