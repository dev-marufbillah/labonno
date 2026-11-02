"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface HeroSlide {
  title: string;
  subtitle: string;
  eyebrow: string;
  image: string;
  mobileImage?: string;
  ctaLabel: string;
  ctaHref: string;
  align?: "left" | "center" | "right";
}

export function HeroCarousel({ slides, autoPlay = true }: { slides: HeroSlide[]; autoPlay?: boolean }) {
  const [index, setIndex] = React.useState(0);
  const count = slides.length;

  const go = React.useCallback(
    (direction: number) => setIndex((prev) => (prev + direction + count) % count),
    [count]
  );

  React.useEffect(() => {
    if (!autoPlay || count <= 1) return;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % count), 7000);
    return () => clearInterval(timer);
  }, [autoPlay, count]);

  if (!count) return null;

  return (
    <section className="shell pt-4 md:pt-6">
      <div className="relative overflow-hidden rounded-lg md:rounded-xl">
        <div className="relative h-[440px] w-full sm:h-[520px] lg:h-[600px]">
          {slides.map((slide, i) => (
            <div
              key={`${slide.title}-${i}`}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1100ms] ease-luxe",
                i === index ? "opacity-100" : "pointer-events-none opacity-0"
              )}
              aria-hidden={i !== index}
            >
              <Image
                src={slide.image}
                alt={slide.title || "LABONNO collection"}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-[60%_center] md:object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cream/90 via-cream/45 to-transparent md:from-cream/80 md:via-cream/20" />
            </div>
          ))}

          <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10 lg:px-16">
            {slides.map((slide, i) => (
              <div
                key={`content-${i}`}
                className={cn(
                  "max-w-md transition-all duration-700",
                  i === index ? "block animate-fade-up" : "hidden"
                )}
              >
                {slide.eyebrow ? (
                  <p className="label-line text-[9.5px] tracking-label text-ink-soft">{slide.eyebrow}</p>
                ) : null}
                <h1 className="mt-4 font-serif text-[40px] font-light leading-[0.98] tracking-[-0.02em] text-ink sm:text-[54px] lg:text-[64px]">
                  {slide.title}
                </h1>
                {slide.subtitle ? (
                  <p className="mt-3 font-serif text-[30px] italic leading-none text-gold-dark sm:text-[38px]">
                    {slide.subtitle}
                  </p>
                ) : null}
                {slide.ctaLabel ? (
                  <Link
                    href={slide.ctaHref || "/shop"}
                    className="group mt-8 inline-flex items-center gap-2 rounded-full border border-ink/35 bg-cream/40 px-6 py-3 text-[9.5px] uppercase tracking-label text-ink backdrop-blur-sm transition-all duration-300 hover:bg-ink hover:text-cream"
                  >
                    {slide.ctaLabel}
                    <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>

          {count > 1 && (
            <div className="absolute bottom-5 left-6 z-10 flex items-center gap-2 sm:left-10 lg:left-16">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className="grid size-8 place-items-center rounded-full bg-white/75 text-ink backdrop-blur transition hover:bg-white"
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className="grid size-8 place-items-center rounded-full bg-white/75 text-ink backdrop-blur transition hover:bg-white"
              >
                <ArrowRight className="size-3.5" strokeWidth={1.5} />
              </button>
              <div className="ml-2 flex gap-1.5">
                {slides.map((slide, i) => (
                  <button
                    key={`dot-${i}`}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      i === index ? "w-6 bg-ink/70" : "w-2.5 bg-ink/25 hover:bg-ink/40"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
