"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const dummyChats = [
  {
    name: "nwkch5h0xu",
    preview: "Dear customer, ple...",
    date: "Fri",
    unread: 6,
    avatar: "/images/default_pic.png",
  },
  {
    name: "Shopee Choice G...",
    preview: "Hi dear! 🎁 Thank ...",
    date: "23/03",
    unread: 3,
    avatar: "/images/default_pic.png",
  },
  {
    name: "spraygadget",
    preview: "[Image]",
    date: "07/02",
    unread: 3,
    avatar: "/images/default_pic.png",
  },
];

export default function RightPanel() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, input]);
    setInput("");
  };

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto p-4 text-sm">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet</p>
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
  );
}
