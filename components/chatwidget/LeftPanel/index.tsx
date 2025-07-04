"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { Chat } from "@/types/chatlist";
import { debounce } from "lodash";
import { LeftPanelProps } from "@/types/chatlist";

const LeftPanel: React.FC<LeftPanelProps> = ({ onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const fetchChatList = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await axios.get("/api/protected/chatListAPI", {
        withCredentials: true, // 🔒 include cookies (important!)
      });
      if (response.data && Array.isArray(response.data.data)) {
        setChats(response.data.data);
        setHasError(false);
      } else {
        console.log("Invalid response format for chat list:", response.data);
        setChats([]); // fallback to empty list
        setHasError(true); // Indicate an error if format is wrong
      }
    } catch (error) {
      console.log(
        "Error fetching chat list:",
        error.response?.data || error.message,
      );
      setHasError(true);
      setChats([]); // Clear chats on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchName = useCallback(
    async (username: string) => {
      if (!username.trim()) {
        fetchChatList();
        return;
      }

      setIsLoading(true);
      setHasError(false);
      try {
        const response = await axios.post(
          "/api/protected/searchChatNameAPI",
          { username: username },
          { withCredentials: true },
        );
        if (response.data.success && Array.isArray(response.data.data)) {
          const chatData: Chat = {
            contact_id: Number(response.data.data[0].user_id),
            contact_username: response.data.data[0].username,
            contact_profile_picture: response.data.data[0].profile,
            last_message_date: "",
            last_message_content: "",
            unread: 0,
          };
          setChats([chatData]);
          setHasError(false);
        } else {
          setChats([]);
          setHasError(false);
        }
      } catch (error) {
        console.log(
          "Error searching name:",
          error.response?.data || error.message,
        );
        setHasError(true);
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchChatList],
  );

  const debouncedSearchName = useCallback(
    debounce((username: string) => searchName(username), 300),
    [searchName],
  );

  // Effect for initial chat list load
  useEffect(() => {
    const loadInitialChats = async () => {
      await fetchChatList();
      setInitialLoadComplete(true); // Mark initial load as complete
    };
    loadInitialChats();
  }, [fetchChatList]);

  useEffect(() => {
    if (initialLoadComplete) {
      debouncedSearchName(searchInput);
    }

    return () => {
      debouncedSearchName.cancel();
    };
  }, [searchInput, debouncedSearchName, initialLoadComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <div className="flex h-screen w-1/3 flex-col border-r bg-white">
      <div className="border-b px-4 py-2 text-lg font-semibold text-red-600">
        Chat ({chats.length})
      </div>

      <div className="p-2">
        <input
          type="text"
          placeholder="Search name"
          className="w-full rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={searchInput}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading chats...
          </div>
        ) : hasError ? (
          <div className="p-4 text-center text-sm text-red-500">
            Error loading chats. Please try again.
          </div>
        ) : searchInput.trim() && chats.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No results found for "{searchInput}".
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No messages found.
          </div>
        ) : (
          chats.map((chat, index) => (
            <div
              key={chat.contact_id || `chat-${index}`} // Added index fallback for key
              onClick={() => onSelectChat(chat.contact_id)}
              className={`mx-2 my-1 flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 transition-colors duration-150 hover:bg-gray-100`}
            >
              <div className="flex min-w-0 flex-grow items-center gap-2">
                {/* Added flex-grow and min-w-0 */}
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300">
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
                    onError={(e) => {
                      e.currentTarget.src = "/images/default-avatar.png"; // Provide a default image path
                    }}
                  />
                </div>
                <div className="flex min-w-0 flex-grow flex-col">
                  {/* Added flex-grow */}
                  <span className="truncate text-sm font-medium text-gray-800">
                    {chat.contact_username}
                  </span>
                  <span className="truncate text-xs text-gray-500">
                    {chat.last_message_content || "[No message]"}
                  </span>
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end text-right">
                {/* Added text-right */}
                <span className="text-xs whitespace-nowrap text-gray-400">
                  {/* Added whitespace-nowrap */}
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
                  <span className="mt-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
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
