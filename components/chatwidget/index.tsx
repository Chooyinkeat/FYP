"use client";

import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, input]);
    setInput("");
    // Optional: simulate bot reply
    setTimeout(() => {
      setMessages((prev) => [...prev, "Thanks for your message!"]);
    }, 500);
  };

  return (
    <div className="fixed right-5 bottom-5 z-50">
      {/* Chat button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg"
        >
          💬 Chat
        </button>
      )}

      {/* Chat box */}
      {open && (
        <div className="flex h-96 w-80 flex-col rounded-lg border border-gray-300 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-lg bg-blue-600 px-4 py-2 text-white">
            <span>Live Chat</span>
            <button onClick={() => setOpen(false)} className="text-white">
              ✖
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-2 overflow-y-auto p-4 text-sm">
            {messages.map((msg, idx) => (
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
            ))}
          </div>

          {/* Input */}
          <div className="flex border-t px-2 py-2">
            <input
              type="text"
              className="flex-1 rounded-md border px-2 py-1 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              className="ml-2 rounded-md bg-blue-600 px-4 py-1 text-sm text-white"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
