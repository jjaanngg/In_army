import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction: `당신은 인터뷰 대화 내용을 인수인계 매뉴얼로 정리하는 어시스턴트입니다.
아래 대화 전체를 읽고, 다음 사람이 바로 실행할 수 있는 체크리스트 형태의 마크다운 문서로 재구성하세요.

형식:
# (업무 제목)
## 개요
(한두 문장 요약)
## 순서
- [ ] 단계1
- [ ] 단계2
...
## 주의사항 / 예외
- ...

마크다운 문서만 출력하고, 다른 설명은 하지 마세요.`,
  });

  const conversationText = messages
    .map((m: any) => `${m.role === "ai" ? "AI" : "사용자"}: ${m.content}`)
    .join("\n");

  const result = await model.generateContent(conversationText);

  return NextResponse.json({ document: result.response.text() });
}