"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import LeftPanel from "@/components/Chatwidget/LeftPanel";
import RightPanel from "@/components/Chatwidget/RightPanel";
import type { Message } from "@/types/chatlist";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const handleSelectChat = (receiverId: number) => {
    setSelectedChat(receiverId);
  };

  // WebSocket setup
  useEffect(() => {
    const storedUserId = Number(sessionStorage.getItem("userId"));
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    const ws = new WebSocket(
      `${protocol}://${host}/api/ws?userId=${storedUserId}`,
    );
    wsRef.current = ws;
    ws.onopen = () => console.log("Connected to server");
    ws.onmessage = async (event) => {
      try {
        const data =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : JSON.parse(await event.data.text());
        console.log("Received message: ", data);
        if (
          data.type === 0 ||
          data.type === 1 ||
          data.type === 2 ||
          data.type === 3
        ) {
          setMessages((prev) => {
            const exists = prev.some(
              (m) =>
                m.message === data.message &&
                m.sender_id === data.sender_id &&
                m.receiver_id === data.receiver_id &&
                m.created_date === data.created_date,
            );
            return exists ? prev : [...prev, data];
          });
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = () => console.log("Disconnected");

    return () => {
      ws.close();
    };
  }, [setMessages]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat === null) return;

      try {
        const response = await axios.post(
          "/api/protected/getMessageAPI",
          { receiverId: selectedChat },
          { withCredentials: true },
        );

        const result = response.data;

        if (Array.isArray(result?.data)) {
          setMessages(result.data);
        } else {
          console.log("Unexpected format from message API:", result);
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  return (
    <div className="fixed right-5 bottom-5 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg"
        >
          💬 Chat
        </button>
      )}

      {open && (
        <div className="h-[500px] w-[600px] overflow-hidden rounded-lg border bg-white shadow-lg">
          <div className="flex h-full">
            <LeftPanel onSelectChat={handleSelectChat} />

            <div className="flex w-2/3 flex-col bg-gray-50">
              <div className="flex items-center justify-between border-b bg-white px-4 py-2">
                <span className="font-medium text-gray-800">Welcome</span>
                <div className="space-x-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="text-gray-500 hover:text-black"
                    title="Minimize"
                  >
                    &minus;
                  </button>
                  {selectedChat !== null && (
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="text-gray-500 hover:text-black"
                      title="Close chat"
                    >
                      ✖
                    </button>
                  )}
                </div>
              </div>

              {selectedChat === null ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center text-gray-500">
                  <Image
                    src="/images/default_pic.png"
                    alt="Welcome"
                    className="mb-4 h-32"
                    width={128}
                    height={128}
                  />
                  <h2 className="text-lg font-semibold">Welcome to Chat</h2>
                  <p className="text-sm">Start responding to your users now!</p>
                </div>
              ) : (
                <RightPanel
                  contactId={selectedChat}
                  ws={wsRef.current}
                  messages={messages.filter(
                    (msg) =>
                      msg.sender_id === selectedChat ||
                      msg.receiver_id === selectedChat,
                  )}
                  setMessages={setMessages}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
