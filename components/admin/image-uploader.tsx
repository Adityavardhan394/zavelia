"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminFetch } from "@/lib/admin/fetch";
import { cn } from "@/lib/utils/cn";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type UploadedImage = {
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
};

type SignResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

type ImageUploaderProps = {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  className?: string;
};

export function ImageUploader({
  images,
  onChange,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");

  function appendImages(next: UploadedImage[]) {
    if (next.length && !next.some((img) => img.isPrimary)) {
      next[0] = { ...next[0], isPrimary: true };
    }
    onChange(next);
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    setUploading(true);

    try {
      const next = [...images];
      for (const file of Array.from(fileList)) {
        if (!ALLOWED_TYPES.has(file.type)) {
          throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed.");
        }
        if (file.size > MAX_BYTES) {
          throw new Error("Each image must be 5 MB or smaller.");
        }

        const signed = await adminFetch<SignResponse>("/api/admin/uploads/sign", {
          method: "POST",
          body: JSON.stringify({
            folder: "zavelia/products",
            contentType: file.type,
          }),
        });

        const form = new FormData();
        form.append("file", file);
        form.append("api_key", signed.apiKey);
        form.append("timestamp", String(signed.timestamp));
        form.append("signature", signed.signature);
        form.append("folder", signed.folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
          { method: "POST", body: form },
        );
        if (!uploadRes.ok) {
          throw new Error("Cloudinary upload failed.");
        }
        const uploaded = (await uploadRes.json()) as { secure_url: string };
        next.push({
          url: uploaded.secure_url,
          altText: file.name.replace(/\.[^.]+$/, ""),
          sortOrder: next.length,
          isPrimary: next.length === 0,
        });
      }

      appendImages(next);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} You can paste an image URL below instead.`
          : "Upload failed. Paste an image URL below instead.",
      );
      setShowUrlFallback(true);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function addPastedUrl() {
    const url = pasteUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setError("Enter a valid http(s) image URL.");
      return;
    }
    setError(null);
    const next = [
      ...images,
      {
        url,
        altText: "Product image",
        sortOrder: images.length,
        isPrimary: images.length === 0,
      },
    ];
    appendImages(next);
    setPasteUrl("");
  }

  function removeAt(index: number) {
    const next = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, sortOrder: i }));
    if (next.length && !next.some((img) => img.isPrimary)) {
      next[0] = { ...next[0], isPrimary: true };
    }
    onChange(next);
  }

  function setPrimary(index: number) {
    onChange(
      images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload images"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrlFallback((v) => !v)}
        >
          Paste URL
        </Button>
        <p className="text-xs text-[var(--color-espresso)]/55">
          JPEG/PNG/WebP/GIF · max 5 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error ? (
        <p className="text-sm text-[var(--color-error)]" role="alert">
          {error}
        </p>
      ) : null}

      {showUrlFallback ? (
        <div className="space-y-1.5 rounded-md border border-[var(--admin-border)] bg-white/70 p-3">
          <Label htmlFor="image-url">Image URL</Label>
          <div className="flex flex-wrap gap-2">
            <Input
              id="image-url"
              type="url"
              placeholder="https://…"
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              className="min-w-[16rem] flex-1"
            />
            <Button type="button" variant="secondary" onClick={addPastedUrl}>
              Add URL
            </Button>
          </div>
        </div>
      ) : null}

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, index) => (
            <li
              key={`${img.url}-${index}`}
              className="admin-card relative overflow-hidden"
            >
              <div className="relative aspect-square bg-[var(--color-champagne)]/30">
                <Image
                  src={img.url}
                  alt={img.altText || "Product image"}
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized={
                    !img.url.includes("res.cloudinary.com") &&
                    !img.url.startsWith("/")
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <button
                  type="button"
                  className={cn(
                    "text-xs underline-offset-2 hover:underline",
                    img.isPrimary
                      ? "font-semibold text-[var(--color-rose-gold)]"
                      : "text-[var(--color-espresso)]/60",
                  )}
                  onClick={() => setPrimary(index)}
                >
                  {img.isPrimary ? "Primary" : "Set primary"}
                </button>
                <button
                  type="button"
                  aria-label="Remove image"
                  className="rounded p-1 text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                  onClick={() => removeAt(index)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
