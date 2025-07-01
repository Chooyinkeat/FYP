"use client";
import { useEffect, useRef, useState } from "react";

const dummyChats = [
  {
    name: "nwkch5h0xu",
    preview: "Dear customer, ple...",
    date: "Fri",
    unread: 6,
    avatar: "🛍️",
  },
  {
    name: "Shopee Choice G...",
    preview: "Hi dear! 🎁 Thank ...",
    date: "23/03",
    unread: 3,
    avatar: "🎉",
  },
  {
    name: "spraygadget",
    preview: "[Image]",
    date: "07/02",
    unread: 3,
    avatar: "📦",
  },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [input, setInput] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, input]);
    setInput("");
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000/api/ws"); // Update to your actual domain in production
    wsRef.current = ws;

    ws.onopen = () => console.log("Connected to server");

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

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
            <div className="w-1/3 border-r bg-white">
              <div className="border-b px-4 py-2 text-lg font-semibold text-red-600">
                Chat ({dummyChats.length})
              </div>

              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search name"
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              </div>

              <div className="overflow-y-auto">
                {dummyChats.map((chat, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedChat(index)}
                    className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:bg-gray-100 ${
                      selectedChat === index ? "bg-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-gray-300 text-center text-xl">
                        {chat.avatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{chat.name}</span>
                        <span className="text-xs text-gray-500">
                          {chat.preview}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400">{chat.date}</span>
                      {chat.unread > 0 && (
                        <span className="mt-1 rounded-full bg-red-500 px-2 text-xs text-white">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex w-2/3 flex-col bg-gray-50">
              <div className="flex items-center justify-between border-b bg-white px-4 py-2">
                <span className="font-medium text-gray-800">
                  {selectedChat !== null
                    ? dummyChats[selectedChat].name
                    : "Welcome"}
                </span>
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
                  <img
                    src="/welcome-chat.png"
                    alt="Welcome"
                    className="mb-4 h-32"
                  />
                  <h2 className="text-lg font-semibold">Welcome to Chat</h2>
                  <p className="text-sm">Start responding to your users now!</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-2 overflow-y-auto p-4 text-sm">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-400">
                        No messages yet
                      </p>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`${
                            idx % 2 === 0
                              ? "bg-gray-200 text-left"
                              : "bg-blue-500 text-right text-white"
                          } max-w-[70%] rounded-md p-2 ${
                            idx % 2 === 0 ? "self-start" : "ml-auto self-end"
                          }`}
                        >
                          {msg}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex border-t bg-white px-2 py-2">
                    <input
                      type="text"
                      className="flex-1 rounded border px-2 py-1 text-sm"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type your message..."
                    />
                    <button
                      onClick={sendMessage}
                      className="ml-2 rounded bg-blue-600 px-4 py-1 text-sm text-white"
                    >
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
