"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export type GalleryImage = {
  id: string;
  url: string;
  altText?: string | null;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const list =
    images.length > 0
      ? images
      : [
          {
            id: "placeholder",
            url: "/brand/zavelia-logo.png",
            altText: productName,
          },
        ];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)]!;

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden bg-[var(--color-champagne)]/30">
        <Image
          src={current.url}
          alt={current.altText || productName}
          fill
          className="object-cover transition duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {list.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {list.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square overflow-hidden border-2 transition",
                index === active
                  ? "border-[var(--color-rose-gold)]"
                  : "border-transparent opacity-80 hover:opacity-100",
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
