"use client"; // This is a client-side component

import { addStory } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { Story, User } from "@prisma/client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState } from "react";

type StoryWithUser = Story & {
  user: User;
};

const StoryList = ({
  stories,
  userId,
}: {
  stories: StoryWithUser[];
  userId: string;
}) => {
  const [storyList, setStoryList] = useState<StoryWithUser[]>(stories); // State to handle stories
  const [img, setImg] = useState<any>(); // State to handle the uploaded image
  const { user } = useUser(); // Get current user info

  // Function to add story (with optimistic UI)
  const add = async () => {
    if (!img?.secure_url) return;

    // Optimistically add a new story to the UI
    const newStory = {
      id: Math.random(), // Temporary random ID
      img: img.secure_url,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      userId: userId,
      user: {
        id: userId,
        username: "Sending...",
        avatar: user?.imageUrl || "/noAvatar.png",
      },
    } as StoryWithUser;

    setStoryList((prev) => [newStory, ...prev]); // Optimistically update the UI

    try {
      const createdStory = await addStory(img.secure_url); // Save to database
      setStoryList((prev) => [createdStory!, ...prev]); // Replace optimistic story with actual data
      setImg(null); // Clear the image after upload
    } catch (err) {
      console.error("Error adding story:", err);
    }
  };

  return (
    <>
      {/* Cloudinary Upload Widget */}
      <CldUploadWidget
        uploadPreset="social"
        onSuccess={(result, { widget }) => {
          setImg(result.info); // Set the uploaded image URL
          widget.close(); // Close the widget after success
        }}
      >
        {({ open }) => (
          <div className="flex flex-col items-center gap-2 cursor-pointer relative">
            <Image
              src={img?.secure_url || user?.imageUrl || "/noAvatar.png"}
              alt="Add Story"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full ring-2 object-cover"
              onClick={() => open()} // Trigger the Cloudinary upload widget
            />
            {img ? (
              <button
                type="button"
                onClick={add} // Add the story when clicked
                className="text-xs bg-blue-500 p-1 rounded-md text-white"
              >
                Send
              </button>
            ) : (
              <span className="font-medium">Add a Story</span>
            )}
            <div className="absolute text-6xl text-gray-200 top-1">+</div>
          </div>
        )}
      </CldUploadWidget>

      {/* Render Stories */}
      {storyList.map((story) => (
        <div
          className="flex flex-col items-center gap-2 cursor-pointer"
          key={story.id}
        >
          <Image
            src={story.user.avatar || "/noAvatar.png"}
            alt={story.user.username}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">
            {story.user.name || story.user.username}
          </span>
        </div>
        
      ))}
    </>
  );
};

export default StoryList;
