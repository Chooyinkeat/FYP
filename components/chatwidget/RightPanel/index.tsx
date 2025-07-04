"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import type { RightPanelProps, Message } from "@/types/chatlist";

const RightPanel: React.FC<RightPanelProps> = ({
  contactId,
  ws,
  messages,
  setMessages,
}) => {
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const sendDB = async () => {
    try {
      const response = await axios.post(
        "/api/protected/sendMessageAPI",
        {
          receiverId: contactId,
          message: input.trim(),
        },
        {
          withCredentials: true, // 🔒 include cookies (important!)
        },
      );
      return response.data;
    } catch (error) {
      console.log("Error fetching user ID:", error);
    }
  };

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  const numId = Number(userId);
  const sendMessage = () => {
    if (!input.trim() || !ws || contactId === null) {
      console.log("Invalid message");
      return;
    }

    const msgToSend: Message = {
      type: "chat",
      chat_id: Date.now(), // temporary unique ID
      sender_id: numId,
      receiver_id: contactId,
      message: input.trim(),
      created_date: new Date().toISOString(),
      last_updated_date: new Date().toISOString(),
    };

    ws.send(JSON.stringify(msgToSend));
    setMessages((prev) => [...prev, msgToSend]); // Optimistic update
    setInput("");
    sendDB().then((data) => {
      if (data.success) {
        console.log("Message sent successfully");
      } else {
        console.error("Failed to send message:", data.message);
      }
    });
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="border-b bg-white px-4 py-2 text-sm font-medium text-gray-800">
          Chatting with contact ID: {contactId}
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4 text-sm">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400">No messages yet</p>
          ) : (
            messages.map((msg, idx) => {
              const isSent = msg.sender_id !== contactId;
              return (
                <div
                  key={msg.chat_id ?? idx}
                  className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-md ${
                      isSent
                        ? "rounded-br-none bg-blue-600 text-white"
                        : "rounded-bl-none bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    <span className="mt-1 block text-right text-[10px] text-gray-400">
                      {new Date(msg.created_date).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="flex items-center gap-2 border-t bg-white px-2 py-2">
          <label className="cursor-pointer text-sm text-blue-600 hover:underline">
            📎
            <input
              type="file"
              className="hidden"
              // onChange={handleFileChange}
              disabled={contactId === null}
            />
          </label>
          {/* Message Input */}
          <input
            type="text"
            className="flex-1 rounded border px-2 py-1 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            disabled={contactId === null}
          />
          {/* Send Button */}
          <button
            onClick={sendMessage}
            className={`rounded px-4 py-1 text-sm text-white ${
              contactId === null ? "bg-gray-400" : "bg-blue-600"
            }`}
            disabled={contactId === null}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default RightPanel;
