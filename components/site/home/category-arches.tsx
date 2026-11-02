import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryDoc } from "@/lib/db/types";

export function CategoryArches({ categories }: { categories: CategoryDoc[] }) {
  if (!categories.length) return null;
  return (
    <section className="shell pt-10 md:pt-14">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
        {categories.slice(0, 4).map((category) => (
          <Link key={category.slug} href={`/category/${category.slug}`} className="group block">
            <div className="relative aspect-[3/4.6] w-full overflow-hidden rounded-t-full rounded-b-lg bg-cream-200">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="font-serif text-[15px] text-ink sm:text-base">{category.name}</span>
              <ArrowRight
                className="size-3 -translate-x-1 text-ink-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                strokeWidth={1.5}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
