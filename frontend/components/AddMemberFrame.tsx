"use client";

import { addUserToGroupAction } from "@/actions/groups.server";
import { searchUsersAction } from "@/actions/users.server";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { AddUserToGroupResponse, } from "@/schemas/transaction.schema";
import { addMemberSchema } from "@/actions/zod";
import { ErrorText } from "@/components/Errors";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { AddUserToGroupFormData } from "@/schemas/fe.schema";
import { div } from "motion/react-client";
import Image from "next/image"

export default function AddMemberFrame({ groupId }: { groupId: number }) {
	return (
		<div className="flex flex-row">
			<div className="basis-1/3">
				<ViewGroupMembersFrame groupId={groupId} />
			</div>
			

			<div className="basis-2/3 m-auto h-max max-w-md space-y-8">
			<div className="text-center">
				<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
					Add a new member
				</h2>
				<p className="mt-2 text-sm text-gray-600">
					Enter the username of the member 
				</p>
			</div>
			<AddMemberForm groupId={groupId}  />
		</div>
		</div>
		
	);
}

function ViewGroupMembersFrame({ groupId }: { groupId: number }) {
	return (
		<div className="m-auto h-max max-w-md space-y-8">
			<div className="text-center">
				<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
					 Group Members
				</h2>
			</div>
			
			
            <div className="m-auto items-center">
			<div className="mx-auto flex items-center gap-x-4 rounded-l bg-white p-3  outline outline-black/10 ">
			<Image src="/profile-placeholder.png" className="rounded-full" width={48} height={48} alt="avatar" ></Image>
			<div>
				<div className="text-xl font-medium text-black ">test01</div>
			</div>
			</div>
			<div className="mx-auto flex items-center gap-x-4 rounded-l bg-white p-3  outline outline-black/10 ">
			<Image src="/profile-placeholder.png" className="rounded-full" width={48} height={48} alt="avatar" ></Image>
			<div>
				<div className="text-xl font-medium text-black ">test02</div>
			</div>
			</div>
			

			</div>
			

			
			
		</div>
	);
}

function AddMemberForm({ groupId  }: {groupId: number}) {

	const [searchQuery, setSearchQuery] = useState("");
	const [suggestions, setSuggestions] = useState<{ id: number; username: string }[]>([]);
	const [loading, setLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

	const {
		register,
		handleSubmit,
		setError,
		setValue,
		reset,
		formState: { errors, isSubmitting },
	} = useForm({ resolver: zodResolver(addMemberSchema),
		defaultValues: {groupId}
		
	 });

	// Add hidden input for groupId
	useEffect(() => {
	setValue("groupId", groupId);
	}, [groupId, setValue]);

	  // Debounced search using server action
	  useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();
	
		const debounceTimer = setTimeout(async () => {
		  const query = searchQuery.trim();
		  if (!query || query.length < 3) {
			setSuggestions([]);
			return;
		  }
	
		  try {
			setLoading(true);
			// Call server action directly
			const result = await searchUsersAction(query);
			
			if (result.success && isMounted) {
			  console.log(result.users);
			  setSuggestions(result.users);
			}
		  } catch (error) {
			if (isMounted) {
			  setError("root", { 
				message: error instanceof Error ? error.message : "Search failed" 
			  });
			}
		  } finally {
			if (isMounted) setLoading(false);
		  }
		}, 500);
	
		return () => {
		  isMounted = false;
		  controller.abort();
		  clearTimeout(debounceTimer);
		};
	  }, [searchQuery, setError]);

	const onSubmit = async (data:AddUserToGroupFormData ) => {
		console.log("Form submitted:", data);
		const response: AddUserToGroupResponse = await addUserToGroupAction(
			data,
			groupId
		);
		if (!response.success) {
			console.log(response.message);
			reset({ members: "" });
			setSearchQuery("");
			setSuggestions([]);
			// if the response wasn't ok, the error message will be stored at response.message
			setError("root", { message: response.message });
		} else {
			// if response was ok, redirect to login
			// redirect("/user/login");
		setSuccessMessage("Member added successfully!");
        reset({ members: "" });
        setSearchQuery("");
        setSuggestions([]);
        
        // Optional: Redirect after 2 seconds
        setTimeout(() => {
          redirect(`/groups/${groupId}`);
        }, 2000);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

			{successMessage && <div className="text-green-500">{successMessage}</div>}
			
     
			<div className="relative">
				<Input type="text" {...register("members")}  label="Member" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}  autoComplete="off"/>
				<Input
					type="hidden"
					{...register("members")}
				/>

				{errors.members && (
					<ErrorText message={errors.members.message} />
				)}

				{searchQuery.length > 2 && (
							<div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
							{loading ? (
								<div className="p-2 text-gray-500">Searching...</div>
							) : suggestions.length > 0 ? (
								suggestions.map((username) => (
								<div
									key={username.id}
									className="p-2 cursor-pointer hover:bg-gray-100"
									onClick={() => {
									setValue("members", username.username);
									setSearchQuery("");
									setSuggestions([]);
									}}
								>
									{username.username}
								</div>
								))
							) : (
								<div className="p-2 text-gray-500">No users found</div>
							)}
							</div>
						)}
			</div>

			<Button  className="w-full" type="submit" disabled={isSubmitting}>
				Submit
			</Button>
			{errors.root && <ErrorText message={errors.root.message} />}
		</form>
	);
}
