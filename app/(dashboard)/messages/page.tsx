"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function MessagesPage() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "artisan",
      name: "David Eze",
      avatar: "/images/talents.png",
      text: "Hello Daniel! I saw your post regarding the sink pipe repair in Independence Layout. I have original PPR replacement pipes with me.",
      time: "1:15 PM",
    },
    {
      id: 2,
      sender: "customer",
      name: "You",
      text: "Hello David! Perfect, the cabinet floor is getting soaked so the sooner you can get here, the better.",
      time: "1:18 PM",
    },
    {
      id: 3,
      sender: "artisan",
      name: "David Eze",
      avatar: "/images/talents.png",
      text: "On my way right now. I should be there in about 20 minutes.",
      time: "1:22 PM",
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "customer",
        name: "You",
        text: inputText.trim(),
        time: "Just now",
      },
    ]);
    setInputText("");
    toast.success("Message sent");
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
          Messages
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
          Chat securely with matched artisans and manage work terms.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs grid grid-cols-1 md:grid-cols-3 min-h-[580px] overflow-hidden">
        {/* Left Conversation List */}
        <div className="border-r border-neutral-100 p-4 space-y-2">
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 cursor-pointer flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0">
              <Image src="/images/talents.png" alt="David Eze" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-[#0F1115] truncate">David Eze</span>
                <span className="text-[10px] text-neutral-400">1:22 PM</span>
              </div>
              <p className="text-xs text-neutral-500 truncate">On my way right now. I should be there...</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl hover:bg-neutral-50 cursor-pointer flex items-center gap-3 opacity-75">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0">
              <Image src="/images/workers.png" alt="John Okafor" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-[#0F1115] truncate">John Okafor</span>
                <span className="text-[10px] text-neutral-400">Yesterday</span>
              </div>
              <p className="text-xs text-neutral-500 truncate">Circuit breaker replaced and verified working.</p>
            </div>
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="md:col-span-2 flex flex-col justify-between h-full bg-neutral-50/30">
          {/* Chat Header */}
          <div className="p-4 border-b border-neutral-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                <Image src="/images/talents.png" alt="David Eze" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0F1115]">David Eze (Plumber)</h3>
                <span className="text-[11px] text-emerald-600 font-medium">● Active now · 2.4 km away</span>
              </div>
            </div>

            <button
              onClick={() => toast("Calling David Eze...", { icon: "📞" })}
              className="px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Call Artisan
            </button>
          </div>

          {/* Message History */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "customer" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm ${
                    m.sender === "customer"
                      ? "bg-[#001B40] text-white rounded-br-xs"
                      : "bg-white border border-neutral-200/80 text-neutral-800 rounded-bl-xs shadow-2xs"
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#001B40]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
