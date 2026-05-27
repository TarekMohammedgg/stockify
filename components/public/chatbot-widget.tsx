"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Loader2, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatbotWidgetProps = {
  userId: string;
  customerName: string;
};

const MarkdownComponents = {
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }: any) => <ul className="mb-2 space-y-2">{children}</ul>,
  ol: ({ children }: any) => <ol className="mb-2 list-decimal list-inside space-y-2">{children}</ol>,
  li: ({ children, className }: any) => {
    const isTask = className?.includes("task-list-item");
    return (
      <li className={`flex gap-2 items-start ${isTask ? "-ms-1" : ""}`}>
        {!isTask && (
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500/80" />
        )}
        <span className="flex-1">{children}</span>
      </li>
    );
  },
  input: ({ type, checked }: any) => {
    if (type === "checkbox") {
      return checked ? (
        <CheckCircle size={18} className="mt-0.5 shrink-0 text-primary-500" />
      ) : (
        <div className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />
      );
    }
    return <input type={type} checked={checked} readOnly />;
  },
  strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
  em: ({ children }: any) => <em className="italic opacity-90">{children}</em>,
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-primary-600 dark:text-primary-400 underline underline-offset-4 opacity-90 hover:opacity-100"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }: any) => (
    <div className="my-3 overflow-hidden rounded-xl border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full object-cover" />
    </div>
  ),
};

export default function ChatbotWidget({
  userId,
  customerName,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastExtractedLenRef = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const extractInsights = useCallback(
    (msgs: Message[]) => {
      if (msgs.length < 3) return;
      if (msgs.length === lastExtractedLenRef.current) return;
      lastExtractedLenRef.current = msgs.length;
      fetch("/api/chat/extract-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, userId }),
        keepalive: true,
      }).catch((err) => console.error("Failed to extract insights:", err));
    },
    [userId],
  );

  const handleClose = () => {
    setIsOpen(false);
    extractInsights(messages);
  };

  const startNewOrder = useCallback(() => {
    setOrderId(null);
    setMessages([{
      role: "assistant",
      content: `أهلاً ${customerName}! 👋 أنا مساعدك في ستوكيفاي. هل تحب تطلب ديليفري ولا تيك أواي؟`,
    }]);
  }, [customerName]);

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
      if (orderId) startNewOrder();
    }
  };

  // Initial greeting from bot — personalized based on past orders
  useEffect(() => {
    fetch(`/api/insights?user_id=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        const hasInsights =
          data?.data?.favourite_items?.length > 0 || data?.data?.default_address;
        const greeting = hasInsights
          ? `أهلاً ${customerName}! 👋 عارف إنك بتحبوا أصنافنا 😊 هل تحب تطلب تاني؟`
          : `أهلاً ${customerName}! 👋 أنا مساعدك في ستوكيفاي. هل تحب تطلب ديليفري ولا تيك أواي؟`;
        setMessages([{ role: "assistant", content: greeting }]);
      })
      .catch(() => {
        setMessages([{
          role: "assistant",
          content: `أهلاً ${customerName}! 👋 أنا مساعدك في ستوكيفاي. هل تحب تطلب ديليفري ولا تيك أواي؟`,
        }]);
      });
  }, [customerName, userId]);

  // Listen for "Order Now" button from menu
  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setOrderId((prev) => {
        if (prev) startNewOrder();
        return prev ? null : prev;
      });
    };
    window.addEventListener("open-chatbot", handler);
    return () => window.removeEventListener("open-chatbot", handler);
  }, [startNewOrder]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isPending]);

  // Debounced background extract-insights after a quiet pause in conversation.
  useEffect(() => {
    if (isPending) return;
    if (messages.length < 3) return;
    const t = setTimeout(() => extractInsights(messages), 1500);
    return () => clearTimeout(t);
  }, [messages, isPending, extractInsights]);

  // Best-effort save on tab close — sendBeacon survives navigation/unload.
  useEffect(() => {
    const handler = () => {
      if (messages.length < 3) return;
      if (messages.length === lastExtractedLenRef.current) return;
      const blob = new Blob(
        [JSON.stringify({ messages, userId })],
        { type: "application/json" },
      );
      navigator.sendBeacon?.("/api/chat/extract-insights", blob);
    };
    window.addEventListener("pagehide", handler);
    return () => window.removeEventListener("pagehide", handler);
  }, [messages, userId]);

  // Refocus input field after sending a message (isPending transitions back to false)
  useEffect(() => {
    if (!isPending && isOpen && !orderId) {
      inputRef.current?.focus();
    }
  }, [isPending, isOpen, orderId]);

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
      const botReply: Message = {
        role: "assistant",
        content: data.reply ?? "عذراً، حصل خطأ. حاول تاني.",
      };
      setMessages((prev) => [...prev, botReply]);

      // If order was confirmed and submitted to DB
      if (data.orderId) {
        setOrderId(data.orderId);
      }
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
    <div className="fixed bottom-4 end-4 start-4 sm:start-auto sm:bottom-6 sm:end-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {isOpen && (
        <div
          dir="rtl"
          className="flex h-[min(550px,calc(100dvh-6rem))] w-full sm:w-[380px] flex-col overflow-hidden rounded-2xl border-2 border-primary-500 bg-white shadow-2xl dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary-500 px-4 py-3 text-white">
            <div>
              <p className="font-display text-sm font-bold text-white">
                مساعد ستوكيفاي
              </p>
              <p className="text-xs text-primary-100">بيرد بالعامية المصرية</p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-primary-600 hover:text-white"
              aria-label="إغلاق المحادثة"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-900">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "rounded-es-sm bg-primary-500 text-white shadow-sm"
                      : "rounded-ee-sm bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 shadow-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownComponents}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Order success card */}
            {orderId && (
              <div className="mx-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm dark:border-green-900/40 dark:bg-green-950/30">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle size={18} className="shrink-0" />
                  <span className="font-bold">تم تأكيد طلبك!</span>
                </div>
                <p className="mt-1 text-green-600 dark:text-green-500">
                  رقم الطلب: <span className="font-mono font-bold">#{orderId.slice(-8).toUpperCase()}</span>
                </p>
                <p className="mt-1 text-xs text-green-600/80 dark:text-green-500/80">
                  هيظهر الطلب عند الكاشير دلوقتي ✅
                </p>
                <button
                  onClick={startNewOrder}
                  className="mt-3 w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                >
                  اطلب مرة أخرى 🛍️
                </button>
              </div>
            )}

            {/* Typing indicator */}
            {isPending && (
              <div className="flex justify-end">
                <div className="flex items-center gap-1 rounded-2xl rounded-ee-sm bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-4 py-3 shadow-sm">
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-primary-500 opacity-75"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-primary-500 opacity-75"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-primary-500 opacity-75"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={orderId ? "تم تسجيل طلبك ✅" : "اكتب رسالتك..."}
                rows={1}
                disabled={isPending || !!orderId}
                className="flex-1 resize-none rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={isPending || !input.trim() || !!orderId}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="إرسال"
              >
                {isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <button
        onClick={handleToggle}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg hover:shadow-xl hover:shadow-primary-500/30 hover:bg-primary-600 transition-all active:scale-95 border-2 border-white dark:border-neutral-900"
        aria-label={isOpen ? "إغلاق المحادثة" : "فتح المحادثة"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
