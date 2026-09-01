import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  // messages: [{ role: "user" | "assistant", content: string }, ...]

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `당신은 어떤 업무의 인수인계 인터뷰어입니다.
사용자가 자기 업무를 설명하면, 빠진 부분(순서, 예외 상황, 이유)을 짧고 구체적인 질문 하나로 되물으세요.
질문은 한 문장으로, 존댓말로 작성하세요. 질문 외의 다른 말은 하지 마세요.`,
  });

  const history = messages.slice(0, -1).map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessage(lastMessage);

  return NextResponse.json({ question: result.response.text() });
}