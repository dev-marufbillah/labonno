import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-20">
      <div className="w-full max-w-lg text-center">
        <p className="font-serif text-[22px] tracking-[0.16em] text-ink">LABONNO</p>
        <p className="mt-1 text-[8px] uppercase tracking-[0.4em] text-ink-muted">The Art of Elegance</p>
        <h1 className="mt-10 font-serif text-[64px] font-light leading-none text-ink">404</h1>
        <p className="mt-4 font-serif text-2xl">This page has slipped away</p>
        <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed text-ink-muted">
          The page you are looking for may have been moved, or the piece may have sold out and been archived.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-ink px-7 py-3 text-[10px] uppercase tracking-label text-cream transition hover:bg-ink-soft">
            Return home
          </Link>
          <Link href="/shop" className="rounded-full border border-ink/25 px-7 py-3 text-[10px] uppercase tracking-label text-ink transition hover:bg-ink hover:text-cream">
            Shop the collection
          </Link>
        </div>
      </div>
    </div>
  );
}
