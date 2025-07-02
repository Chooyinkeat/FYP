"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Chat } from "@/types/chatlist"; // Adjust the import path as necessary

interface LeftPanelProps {
  onSelectChat: (contactId: number) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchChatList = async () => {
    try {
      const response = await axios.get("/api/protected/chatListAPI", {
        withCredentials: true, // 🔒 include cookies (important!)
      });

      return response.data; // Assuming your API returns the user data in this format
    } catch (error) {
      console.log("Error details:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    const loadChats = async () => {
      const result = await fetchChatList();
      if (result && Array.isArray(result.data)) {
        setChats(result.data);
      } else {
        console.log("Invalid response format:", result);
        setChats([]); // fallback to empty list
      }
      setIsLoading(false);
    };

    loadChats();
  }, []);
  return (
    <div className="w-1/3 border-r bg-white">
      <div className="border-b px-4 py-2 text-lg font-semibold text-red-600">
        Chat ({chats.length})
      </div>

      <div className="p-2">
        <input
          type="text"
          placeholder="Search name"
          className="w-full rounded border px-2 py-1 text-sm"
        />
      </div>

      <div className="overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading chats...
          </div>
        ) : hasError || chats.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No messages found.
          </div>
        ) : (
          chats.map((chat, index) => (
            <div
              key={chat.contact_id}
              onClick={() => onSelectChat(chat.contact_id)}
              className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:bg-gray-100 ${
                selectedChat === index ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-300">
                  <Image
                    src={
                      chat.contact_profile_picture?.startsWith("http")
                        ? chat.contact_profile_picture
                        : "/images/" + chat.contact_profile_picture
                    }
                    alt={`${chat.contact_username} avatar`}
                    width={40}
                    height={40}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {chat.contact_username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {chat.last_message_content?.slice(0, 25) || "[No message]"}
                    ...
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">
                  {new Date(chat.last_message_date).toLocaleDateString(
                    "en-MY",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    },
                  )}
                </span>
                {chat.unread && chat.unread > 0 && (
                  <span className="mt-1 rounded-full bg-red-500 px-2 text-xs text-white">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default LeftPanel;
