"use client";
import axios from "axios";
import { FaPaperclip } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import type { RightPanelProps, Message } from "@/types/chatlist";

const RightPanel: React.FC<RightPanelProps> = ({
  contactId,
  ws,
  messages,
  setMessages,
}) => {
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const numId = Number(userId);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  const sendDB = async (msg: Message) => {
    try {
      const response = await axios.post(
        "/api/protected/sendMessageAPI",
        {
          receiverId: msg.receiver_id,
          message: msg.message,
          type: msg.type,
          mime_type: msg.mime_type,
          file_name: msg.file_name,
        },
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      console.log("Error sending message to DB:", error);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !ws || contactId === null) {
      console.log("Invalid message");
      return;
    }

    const msgToSend: Message = {
      type: 0,
      chat_id: Date.now(),
      sender_id: numId,
      receiver_id: contactId,
      message: input.trim(),
      created_date: new Date().toISOString(),
      last_updated_date: new Date().toISOString(),
    };

    ws.send(JSON.stringify(msgToSend));
    setMessages((prev) => [...prev, msgToSend]);
    setInput("");
    sendDB(msgToSend);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ws || contactId === null) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;

      let fileType: Message["type"] = 3;
      if (file.type.startsWith("image/")) fileType = 1;
      else if (file.type.startsWith("video/")) fileType = 2;

      const fileMessage: Message = {
        type: fileType,
        chat_id: Date.now(),
        sender_id: numId,
        receiver_id: contactId,
        message: base64,
        mime_type: file.type,
        file_name: file.name,
        created_date: new Date().toISOString(),
        last_updated_date: new Date().toISOString(),
      };

      ws.send(JSON.stringify(fileMessage));
      setMessages((prev) => [...prev, fileMessage]);
      sendDB(fileMessage);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-2 text-sm font-medium text-gray-800">
        Chatting with contact ID: {contactId}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-2 overflow-y-auto px-4 py-2 pb-50"
      >
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet</p>
        ) : (
          messages.map((msg, idx) => {
            const isSent = msg.sender_id !== contactId;

            const messageBubble = () => {
              if (msg.type === 1) {
                return (
                  <img
                    src={msg.message}
                    alt="sent-img"
                    className="max-w-full rounded-md"
                  />
                );
              } else if (msg.type === 2) {
                return (
                  <video controls className="max-w-full rounded-md">
                    <source src={msg.message} type={msg.mime_type} />
                    Your browser does not support the video tag.
                  </video>
                );
              } else if (msg.type === 3) {
                return (
                  <a
                    href={msg.message}
                    download={msg.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    📎 {msg.file_name}
                  </a>
                );
              } else {
                return (
                  <p className="break-words whitespace-pre-wrap">
                    {msg.message}
                  </p>
                );
              }
            };

            return (
              <div
                key={msg.chat_id ?? idx}
                className={`flex ${
                  isSent ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-md ${
                    isSent
                      ? "rounded-br-none bg-blue-600 text-white"
                      : "rounded-bl-none bg-gray-100 text-gray-800"
                  }`}
                >
                  {messageBubble()}
                  <span className="mt-1 block text-right text-[10px] text-gray-400">
                    {new Date(msg.created_date).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-10 flex items-center gap-2 border-t bg-white px-2 py-2">
        <label className="cursor-pointer text-xl text-blue-600 hover:underline">
          <FaPaperclip />
          <input
            type="file"
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            disabled={contactId === null}
          />
        </label>

        <input
          type="text"
          className="flex-1 rounded border px-2 py-1 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          disabled={contactId === null}
        />

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
  );
};

export default RightPanel;
