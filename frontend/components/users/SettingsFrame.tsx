"use client";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserDisplayData } from "@/schemas/fe.schema";
import Image from "next/image";
import Button from "@/components/shared/Button";
import Link from "next/link";
import Input from "@/components/shared/Input";
import { FiEdit, FiSave} from "react-icons/fi";
import React, {useState} from "react";
import {updateUsernameAction} from "@/actions/users.server";
import GroupCard from "@/components/groups-page/GroupCard";


export default function SettingsFrame({

	userData,
}: {
	userData: UserDisplayData;

}) {
	const [isEditable, setIsEditable] = useState(false);
	const [inputValue, setInputValue] = useState(userData.username);

	const handleEditClick = () => {
		setIsEditable(prev => !prev);
	};



	const handleSaveClick = async () => {
	const result = await updateUsernameAction({ username: inputValue });

	if (result.ok) {
		setIsEditable(false);
		toast.success("Username updated successfully!");
	} else {
		toast.error((`Error: ${result.message}`))
	}
};



	const handleInputChange = (e) => {
		setInputValue(e.target.value);
	}


	return (
		<div
			className="m-auto mt-16 h-max w-full max-w-xl space-y-4 rounded-lg border-[1px] border-gray-300 p-16 shadow-sm">
			<h2 className="text-3xl font-bold">Settings</h2>
			<div className="flex flex-row flex-nowrap items-center justify-between">
				<div className="flex flex-col flex-nowrap gap-4">
					<div className="flex flex-row flex-nowrap items-center gap-2">
						<ToastContainer aria-label={undefined}/>
						<div className="font-semibold">Username:</div>
						{isEditable ? (
							<div className="flex flex-row items-center gap-2">
								<Input type="text"
									   placeholder={userData.username}
									   value={inputValue}
									   onChange={handleInputChange}
								/>
								<FiSave
									className="cursor-pointer text-xl text-purple-600 hover:text-purple-800"
									onClick={handleSaveClick}
								/>
							</div>
						) : (
							<div className="text-gray-600">{userData.username}</div>
						)}

						<FiEdit className="cursor-pointer text-xl text-purple-600 hover:text-purple-800"
								onClick={handleEditClick}/>
					</div>
					<div className="flex flex-row flex-nowrap items-center gap-2">
						<div className="font-semibold">Email:</div>
						<div className="text-gray-600">{userData.email}</div>
					</div>
				</div>
				<div className="">
					<Image
						src="/profile-placeholder.png"
						alt="Profile"
						width={96}
						height={96}
						className="rounded-[50%] object-cover"
					/>
				</div>
			</div>
			<div className="font-semibold">Groups:</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-1">
				{userData.groups.length > 0 ? (
					userData.groups.map((group) => (
						<GroupCard
							key={group.id}
							groupData={group}
							onView={() => {}}
						/>
					))
				) : (
					<div className="text-gray-600">No groups found</div>
				)}
			</div>

			<Link href={"/user/logout"} className="mt-12 block">
				<Button className="w-full">Log Out</Button>
			</Link>
		</div>
	);
}