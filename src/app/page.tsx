"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };

    // Add user message to state first
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Clear input field
    setIsLoading(true); // Start loading state

    try {
      // Get the latest messages including the new user message
      const updatedMessages = [...messages, userMessage];

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      // Add assistant's response to the messages state
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (error: any) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error.message}. Please try again.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 py-4 px-6">
        <h1 className="text-2xl font-semibold">AI Chat</h1>
      </header>

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 gap-4">
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                  message.role === "user" ? "bg-blue-600" : "bg-zinc-800"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>

              {message.role === "user" && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse delay-75"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse delay-150"></div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-zinc-800 pt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-zinc-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 rounded-full p-2 focus:outline-none focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}