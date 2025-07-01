"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import LeftPanel from "@/components/Chatwidget/LeftPanel";
import RightPanel from "@/components/Chatwidget/RightPanel";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const handleSelectChat = (contactId: number) => {
    setSelectedChat(contactId); // ✅ this is what drives the UI logic
  };

  // Open websocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000/api/ws"); // Update to your actual domain in production
    wsRef.current = ws;

    ws.onopen = () => console.log("Connected to server");

    // ws.onmessage = (event) => {
    //   setMessages((prev) => [...prev, event.data]);
    // };

    ws.onclose = () => console.log("Disconnected");

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="fixed right-5 bottom-5 z-50">
      {/* Chat button (show only when minimized) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg"
        >
          💬 Chat
        </button>
      )}

      {/* Chat Box (show only when open) */}
      {open && (
        <div className="h-[500px] w-[600px] overflow-hidden rounded-lg border bg-white shadow-lg">
          <div className="flex h-full">
            {/* Left Panel */}
            <LeftPanel onSelectChat={handleSelectChat} />
            <div className="flex w-2/3 flex-col bg-gray-50">
              <div className="flex items-center justify-between border-b bg-white px-4 py-2">
                <span className="font-medium text-gray-800">Welcome</span>
                <div className="space-x-2">
                  {/* Minimize Button */}
                  <button
                    onClick={() => setOpen(false)}
                    className="text-gray-500 hover:text-black"
                    title="Minimize"
                  >
                    &minus;
                  </button>
                  {/* Close Chat Button (optional: deselect chat) */}
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
              {/* Messages or Welcome */}
              {selectedChat === null ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center text-gray-500">
                  <Image
                    src="/welcome-chat.png"
                    alt="Welcome"
                    className="mb-4 h-32"
                    width={128}
                    height={128}
                  />
                  <h2 className="text-lg font-semibold">Welcome to Chat</h2>
                  <p className="text-sm">Start responding to your users now!</p>
                </div>
              ) : (
                <RightPanel contactId={selectedChat} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
