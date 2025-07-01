"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface RightPanelProps {
  contactId: number | null;
}

const RightPanel: React.FC<RightPanelProps> = ({ contactId }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  // Simulate fetching messages when contactId changes
  useEffect(() => {
    if (contactId !== null) {
      // Simulated messages (replace with actual API/WebSocket later)
      setMessages([`Welcome to chat with user ${contactId}`]);
    } else {
      setMessages([]);
    }
  }, [contactId]);

  const sendMessage = () => {
    if (!input.trim() || contactId === null) return;

    // Example: Replace this with API or WebSocket call
    setMessages((prev) => [...prev, input]);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {contactId !== null && (
        <div className="border-b bg-white px-4 py-2 text-sm font-medium text-gray-800">
          Chatting with contact ID: {contactId}
        </div>
      )}

      {/* Message list */}
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

      {/* Input field */}
      <div className="flex border-t bg-white px-2 py-2">
        <input
          type="text"
          className="flex-1 rounded border px-2 py-1 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={
            contactId === null
              ? "Select a contact to start chatting..."
              : "Type your message..."
          }
          disabled={contactId === null}
        />
        <button
          onClick={sendMessage}
          className={`ml-2 rounded px-4 py-1 text-sm text-white ${
            contactId === null ? "bg-gray-400" : "bg-blue-600"
          }`}
          disabled={contactId === null}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default RightPanel;
