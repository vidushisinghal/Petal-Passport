import { notFound } from "next/navigation";
import { blooms, getBloom } from "@/lib/blooms";
import BloomDetail from "@/components/BloomDetail";

export function generateStaticParams() {
  return blooms.map((b) => ({ id: b.id }));
}

export default function BloomPage({ params }: { params: { id: string } }) {
  const bloom = getBloom(params.id);
  if (!bloom) notFound();
  return <BloomDetail bloom={bloom} />;
}
