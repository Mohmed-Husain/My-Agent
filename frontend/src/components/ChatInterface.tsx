"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Send, User, RefreshCw, ArrowUpRight } from "lucide-react";
import { ChatMessage, CardItem, CardType } from "@/lib/types";
import { streamChatMessage, fetchChatHistory } from "@/lib/api";
import CardRenderer from "./CardRenderer";

interface ChatInterfaceProps {
  onStateChange?: (state: "idle" | "thinking" | "talking") => void;
}

const QUICK_PROMPTS = [
  "🚀 Show me your featured AI projects",
  "🏆 Tell me about your Google Hackathon win",
  "💼 What experience do you have with Agentic AI?",
  "🧠 How does the LeapSQL-AI 3-agent pipeline work?",
  "📬 How can I reach or hire you?",
];

export default function ChatInterface({ onStateChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [visitorName, setVisitorName] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session from localStorage or restore past chat
  useEffect(() => {
    const savedSession = localStorage.getItem("my_agent_session_id");
    const savedName = localStorage.getItem("my_agent_visitor_name") || "";
    if (savedName) setVisitorName(savedName);

    if (savedSession) {
      setSessionId(savedSession);
      fetchChatHistory(savedSession)
        .then((data) => {
          if (data && data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          } else {
            loadInitialGreeting(savedName);
          }
        })
        .catch(() => loadInitialGreeting(savedName));
    } else {
      loadInitialGreeting(savedName);
    }
  }, []);

  const loadInitialGreeting = (name?: string) => {
    const greetingText = name
      ? `Hi ${name}! Welcome back to my portfolio. I'm Mohmed Husain's AI twin. What would you like to explore today?`
      : `Hello! I'm Mohmed Husain Pasheriya's AI digital twin. I'm a 4th-year Computer Science student at IIIT Vadodara and an AI Backend Engineer. You can ask me anything about my projects, hackathon wins, research in Clinical NLP, or tech stack!`;

    setMessages([
      {
        id: "initial-greeting",
        role: "assistant",
        content: greetingText,
        cards: [
          {
            card_type: "question_card",
            data: {
              question: "Quick shortcuts to get started:",
              options: [
                "Featured Projects",
                "Google Hackathon Award",
                "Work Experience",
                "Contact Details",
              ],
            },
          },
        ],
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isStreaming) return;

    setInput("");
    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `asst-${Date.now()}`;

    // Add User message
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: "user",
        content: messageContent,
        created_at: new Date().toISOString(),
      },
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        cards: [],
        created_at: new Date().toISOString(),
        isStreaming: true,
      },
    ];

    setMessages(newMessages);
    setIsStreaming(true);
    onStateChange?.("thinking");

    let currentText = "";
    const currentCards: CardItem[] = [];

    try {
      const stream = streamChatMessage(messageContent, sessionId, visitorName || null);

      let firstToken = true;
      for await (const chunk of stream) {
        if (firstToken && chunk.type === "text") {
          onStateChange?.("talking");
          firstToken = false;
        }

        if (chunk.type === "text" && chunk.content) {
          currentText += chunk.content;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: currentText } : msg
            )
          );
        } else if (chunk.type === "card" && chunk.card_type) {
          currentCards.push({
            card_type: chunk.card_type as CardType,
            data: chunk.data,
          });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, cards: [...currentCards] }
                : msg
            )
          );
        } else if (chunk.type === "done" && chunk.session_id) {
          setSessionId(chunk.session_id);
          localStorage.setItem("my_agent_session_id", chunk.session_id);
        }
      }
    } catch (err) {
      console.error("Stream error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  currentText ||
                  "Sorry, I had a momentary connection hiccup. Please ask again!",
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      onStateChange?.("idle");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  };

  const handleResetSession = () => {
    localStorage.removeItem("my_agent_session_id");
    setSessionId(null);
    loadInitialGreeting(visitorName);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[650px] md:h-[720px] w-full rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400 shadow-md shadow-cyan-500/20">
            <Image
              src="/avatar/husain-avatar.jpg"
              alt="Mohmed Husain"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              Mohmed Husain Twin
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                v1.0
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Interactive Portfolio & Agentic AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSession}
            title="Start new conversation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-cyan-400/80 shrink-0 mt-1 shadow-sm">
                <Image
                  src="/avatar/husain-avatar.jpg"
                  alt="Mohmed Husain"
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div
              className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-600/20"
                  : "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-md"
              }`}
            >
              {/* Message text */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Typing dots while streaming if content is still empty */}
              {msg.isStreaming && !msg.content && (
                <div className="flex items-center gap-1.5 py-1 text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              {/* Cards attached to the message */}
              {msg.cards && msg.cards.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.cards.map((card, idx) => (
                    <CardRenderer
                      key={idx}
                      card={card}
                      onSelectOption={(opt) => handleSendMessage(opt)}
                    />
                  ))}
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                <User className="w-3.5 h-3.5 text-slate-300" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts footer bar */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/40 overflow-x-auto flex gap-1.5 no-scrollbar">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isStreaming}
            className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <span>{prompt}</span>
            <ArrowUpRight className="w-2.5 h-2.5 text-slate-400" />
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 focus-within:border-cyan-500/70 transition-colors shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about Mohmed Husain, projects, skills..."
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-all disabled:opacity-30 disabled:hover:bg-cyan-500 shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
