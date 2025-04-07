"use client";

import React from "react";
import GroupCard from "./GroupCard";
import { GroupDisplayData } from "@/schemas/fe.schema";

export default function GroupsFrame({ GroupsData }: { GroupsData: GroupDisplayData[] }) {
    return (
        // map through group data to card component 
        <div className="grid grid-cols-3 gap-4 p-4">
            {GroupsData.map((group) => (
                <GroupCard key={group.id} groupData={group} onView={() => {}} />
            ))}
        </div>
    
    

        
    );
}