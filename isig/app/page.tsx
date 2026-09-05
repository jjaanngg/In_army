"use client";

import { useState } from "react";

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
    } catch (err) {
      setDocument("문서 생성 중 에러가 발생했어요.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-zinc-50 dark:bg-black px-4 py-10">
      <div className="w-full max-w-xl flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-center">ISIG 인터뷰</h1>

        <div className="flex flex-col gap-3 bg-white dark:bg-zinc-900 rounded-xl p-4 min-h-[300px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                msg.role === "ai"
                  ? "self-start bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
                  : "self-end bg-black text-white dark:bg-zinc-200 dark:text-black"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="self-start px-4 py-2 text-sm text-zinc-400">
              생각 중...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm bg-white dark:bg-zinc-900"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="답변을 입력하세요..."
            disabled={loading}
          />
          <button
            onClick={handleSend}
            className="rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-sm font-medium disabled:opacity-50"
            disabled={loading}
          >
            전송
          </button>
        </div>

        <button
          onClick={handleGenerateDoc}
          disabled={generating}
          className="text-sm text-zinc-500 underline self-center disabled:opacity-50"
        >
          {generating ? "문서 만드는 중..." : "여기까지 대화로 문서 만들기"}
        </button>

        {document && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 whitespace-pre-wrap text-sm mt-2">
            {document}
          </div>
        )}
      </div>
    </div>
  );
}