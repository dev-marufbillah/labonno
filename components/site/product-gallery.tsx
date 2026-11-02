"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = React.useState(0);
  const [zoom, setZoom] = React.useState(false);

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2 md:w-20 md:flex-col">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={active === index}
              className={cn(
                "relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md border transition md:w-full",
                active === index ? "border-ink" : "border-line hover:border-ink/40"
              )}
            >
              <Image src={image} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative flex-1">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-cream-200">
          <Image
            src={images[active] ?? images[0]}
            alt={name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 45vw"
            className={cn(
              "object-cover transition-transform duration-700 ease-luxe",
              zoom ? "scale-[1.35]" : "scale-100"
            )}
            onClick={() => setZoom((v) => !v)}
          />
          <button
            type="button"
            onClick={() => setZoom((v) => !v)}
            className="absolute bottom-3 right-3 rounded-full bg-white/85 px-3 py-1.5 text-[9px] uppercase tracking-label text-ink backdrop-blur transition hover:bg-white"
          >
            {zoom ? "Reset" : "Zoom"}
          </button>
        </div>
        {images.length > 1 && (
          <div className="mt-2 flex gap-1 md:hidden">
            {images.map((image, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                onClick={() => setActive(index)}
                className={cn("h-1 flex-1 rounded-full transition", active === index ? "bg-ink/70" : "bg-ink/15")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
