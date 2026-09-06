import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: doc, error } = await supabase
    .from("documents")
    .select("content, created_at")
    .eq("share_slug", slug)
    .single();

  if (error || !doc) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-zinc-50 dark:bg-black px-4 py-10">
      <div className="w-full max-w-xl flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-center">ISIG 인수인계 문서</h1>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 whitespace-pre-wrap text-sm">
          {doc.content}
        </div>
      </div>
    </div>
  );
}