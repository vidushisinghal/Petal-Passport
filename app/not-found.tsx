import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.2em] text-warm-gray">Not found</p>
      <h1 className="font-serif text-3xl text-botanical">We couldn't find that bloom.</h1>
      <Link
        href="/"
        className="mt-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm text-botanical transition hover:border-botanical/40"
      >
        ← Back to the map
      </Link>
    </main>
  );
}
