"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatbotWidgetProps = {
  userId: string;
  customerName: string;
};

export default function ChatbotWidget({
  userId,
  customerName,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting from bot
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `أهلاً ${customerName}! 👋 أنا مساعدك في ستوكيفاي. هل تحب تطلب ديليفري ولا تيك أواي؟`,
      },
    ]);
  }, [customerName]);

  // Listen for "Order Now" button from menu
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handler);
    return () => window.removeEventListener("open-chatbot", handler);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isPending]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isPending) return;

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userId,
          customerName,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "عذراً، حصل خطأ. حاول تاني.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "مش قادر أتواصل دلوقتي. حاول تاني." },
      ]);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {isOpen && (
        <div
          dir="rtl"
          className="flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-[--surface-border] bg-[--surface-card] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[--surface-border] px-4 py-3">
            <div>
              <p className="font-display text-sm font-semibold text-[--text-primary]">
                مساعد ستوكيفاي
              </p>
              <p className="text-xs text-[--text-muted]">بيرد بالعامية المصرية</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-[--text-muted] transition-colors hover:bg-[--surface-canvas] hover:text-[--text-primary]"
              aria-label="إغلاق المحادثة"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-es-sm bg-[--surface-canvas] text-[--text-primary]"
                      : "rounded-ee-sm bg-primary-500 text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isPending && (
              <div className="flex justify-end">
                <div className="flex items-center gap-1 rounded-2xl rounded-ee-sm bg-primary-500 px-4 py-3">
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-white opacity-75"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-white opacity-75"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-white opacity-75"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[--surface-border] p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="اكتب رسالتك..."
                rows={1}
                disabled={isPending}
                className="flex-1 resize-none rounded-xl border border-[--surface-border] bg-[--surface-input] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-faint] focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={isPending || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="إرسال"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all hover:bg-primary-600 hover:shadow-xl active:scale-95"
        aria-label={isOpen ? "إغلاق المحادثة" : "فتح المحادثة"}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
