import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function askWithRetry(chat: any, message: string, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await chat.sendMessage(message);
    } catch (err: any) {
      const isOverloaded = err?.status === 503;
      if (isOverloaded && i < retries) {
        await new Promise((r) => setTimeout(r, 1500 * (i + 1))); // 1.5초, 3초 대기 후 재시도
        continue;
      }
      throw err;
    }
  }
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction: `당신은 어떤 업무의 인수인계 인터뷰어입니다.
사용자가 자기 업무를 설명하면, 빠진 부분(순서, 예외 상황, 이유)을 짧고 구체적인 질문 하나로 되물으세요.
질문은 한 문장으로, 존댓말로 작성하세요. 질문 외의 다른 말은 하지 마세요.`,
  });

  const history = messages.slice(0, -1).map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  while (history.length && history[0].role !== "user") {
    history.shift();
  }

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1].content;

  
  try {
    const result = await askWithRetry(chat, lastMessage);
    return NextResponse.json({ question: result.response.text() });
  } catch (err: any) {
    return NextResponse.json(
      { question: "지금 모델이 많이 붐벼요. 잠시 후 다시 시도해주세요." },
      { status: 503 }
    );
  }
}