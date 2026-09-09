import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-8 text-center">
        <span className="text-[15px] font-extrabold tracking-tight text-[#17191C]">
          ISIG
        </span>

        <h1 className="text-[28px] font-extrabold leading-snug tracking-tight text-[#17191C]">
          몸으로 익힌 일을,
          <br />
          말로 설명 못 해서
          <br />
          생기는 인수인계 문제
        </h1>

        <p className="text-[14px] leading-relaxed text-[#6B7280]">
          AI가 대화로 질문을 던지고, 빠진 부분을 되물으며
          <br />
          누구나 바로 실행할 수 있는 체크리스트 문서로 정리해줍니다.
        </p>

        <Link
          href="/login"
          className="w-full rounded-full bg-[#12A594] px-6 py-3 text-[14px] font-medium text-white hover:opacity-90"
        >
          시작하기
        </Link>
      </div>
    </div>
  );
}