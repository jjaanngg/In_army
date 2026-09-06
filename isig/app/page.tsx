"use client";

import { useState } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "먼저 이 업무를 어떤 상황에서 하게 되는지 설명해주세요." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [shareSlug, setShareSlug] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "ai", content: data.question }]);
    } catch (err) {
      setMessages([
        ...updated,
        { role: "ai", content: "에러가 발생했어요. 잠시 후 다시 시도해주세요." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDoc = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      setDocument(data.document);
      setShareSlug(data.shareSlug);
    } catch (err) {
      setDocument("문서 생성 중 에러가 발생했어요.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-5 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-6">
          <span className="text-[15px] font-extrabold tracking-tight text-[#17191C]">
            ISIG
          </span>
          <Link
            href="/my"
            className="text-[13px] font-medium text-[#6B7280] hover:text-[#17191C]"
          >
            내 문서
          </Link>
        </div>

        {/* 채팅 영역 */}
        <div className="flex flex-1 flex-col gap-3 rounded-[28px] bg-[#F7F8FA] p-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] px-4 py-3 text-[14px] leading-relaxed ${
                  msg.role === "ai"
                    ? "rounded-t-2xl rounded-br-2xl rounded-bl-md bg-white text-[#17191C]"
                    : "rounded-t-2xl rounded-bl-2xl rounded-br-md bg-[#12A594] text-white"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl bg-white px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C6CBD3] [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C6CBD3] [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C6CBD3]" />
              </div>
            </div>
          )}
        </div>

        {/* 입력창 */}
        <div className="mt-4 flex items-center gap-2">
          <input
            className="flex-1 rounded-full border border-[#EAECEF] bg-white px-5 py-3 text-[14px] text-[#17191C] outline-none focus:border-[#12A594]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="답변을 입력하세요"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#12A594] text-white transition-opacity disabled:opacity-30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5M12 5L5 12M12 5l7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 문서 생성 */}
        <button
          onClick={handleGenerateDoc}
          disabled={generating}
          className="mt-4 self-center rounded-full border border-[#12A594] px-5 py-2 text-[13px] font-medium text-[#12A594] transition-colors hover:bg-[#12A594] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#12A594]"
        >
          {generating ? "문서 만드는 중..." : "여기까지 대화로 문서 만들기"}
        </button>

        {document && (
          <div className="mt-4 rounded-2xl border border-[#EAECEF] bg-white p-6">
            <div className="mb-3 text-[13px] font-medium text-[#12A594]">
              완성된 문서
            </div>
            <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#17191C]">
              {document}
            </div>
          </div>
        )}

        {shareSlug && (
          <div className="mt-3 flex items-center justify-center gap-2 text-[13px] text-[#6B7280]">
            <span>공유 코드</span>
            <code className="rounded-full bg-[#F7F8FA] px-3 py-1 font-medium text-[#17191C]">
              {shareSlug}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}