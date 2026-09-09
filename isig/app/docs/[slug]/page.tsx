import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data, error } = await supabase.rpc("get_document_by_slug", {
    slug_input: slug,
  });

  const doc = data?.[0];

  if (error || !doc) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-5 py-6">
        <span className="mb-6 text-[15px] font-extrabold tracking-tight text-[#17191C]">
          ISIG
        </span>
        <div className="rounded-2xl border border-[#EAECEF] bg-white p-6">
          <div className="mb-3 text-[13px] font-medium text-[#12A594]">
            공유된 인수인계 문서
          </div>
          <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#17191C]">
            {doc.content}
          </div>
        </div>
      </div>
    </div>
  );
}