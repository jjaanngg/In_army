"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Doc = {
  share_slug: string;
  content: string;
  created_at: string;
};

export default function HomePage() {
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setCheckingAuth(false);

      const { data: docs } = await supabase
        .from("documents")
        .select("share_slug, content, created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      setDocs(docs ?? []);
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (checkingAuth) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-5 py-6">
        <div className="flex items-center justify-between pb-6">
          <span className="text-[15px] font-extrabold tracking-tight text-[#17191C]">
            ISIG
          </span>
          <button
            onClick={handleLogout}
            className="text-[13px] font-medium text-[#6B7280] hover:text-[#17191C]"
          >
            로그아웃
          </button>
        </div>

        <Link
          href="/interview"
          className="mb-4 rounded-full bg-[#12A594] px-5 py-3 text-center text-[14px] font-medium text-white hover:opacity-90"
        >
          새 인터뷰 시작하기
        </Link>

        {docs && docs.length === 0 && (
          <p className="text-center text-[14px] text-[#6B7280]">
            아직 만든 문서가 없습니다.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {docs?.map((doc) => {
            const firstLine =
              doc.content.split("\n").find((line) => line.trim()) ?? "제목 없음";
            return (
              <Link
                key={doc.share_slug}
                href={`/docs/${doc.share_slug}`}
                className="rounded-2xl border border-[#EAECEF] bg-white p-4 hover:bg-[#F7F8FA]"
              >
                <div className="text-[14px] font-medium text-[#17191C]">
                  {firstLine.replace(/^#+\s*/, "")}
                </div>
                <div className="mt-1 text-[12px] text-[#6B7280]">
                  {new Date(doc.created_at).toLocaleString("ko-KR")}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}