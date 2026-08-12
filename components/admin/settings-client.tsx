"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminFetch, AdminApiError } from "@/lib/admin/fetch";
import { paiseToRupees, rupeesToPaise } from "@/lib/utils/money";

export type SettingsData = {
  id: string;
  storeName: string;
  tagline: string;
  whatsappDisplayNumber: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  businessAddress: string | null;
  freeShippingThresholdInPaise: number;
  standardShippingInPaise: number;
  instagramUrl: string | null;
  facebookUrl: string | null;
  isStoreOpen: boolean;
  announcementText: string | null;
};

export function SettingsClient({ settings }: { settings: SettingsData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [whatsappDisplayNumber, setWhatsappDisplayNumber] = useState(
    settings.whatsappDisplayNumber ?? "",
  );
  const [supportEmail, setSupportEmail] = useState(
    settings.supportEmail ?? "",
  );
  const [supportPhone, setSupportPhone] = useState(
    settings.supportPhone ?? "",
  );
  const [businessAddress, setBusinessAddress] = useState(
    settings.businessAddress ?? "",
  );
  const [freeShipping, setFreeShipping] = useState(
    String(paiseToRupees(settings.freeShippingThresholdInPaise)),
  );
  const [standardShipping, setStandardShipping] = useState(
    String(paiseToRupees(settings.standardShippingInPaise)),
  );
  const [instagramUrl, setInstagramUrl] = useState(
    settings.instagramUrl ?? "",
  );
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl ?? "");
  const [isStoreOpen, setIsStoreOpen] = useState(settings.isStoreOpen);
  const [announcementText, setAnnouncementText] = useState(
    settings.announcementText ?? "",
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await adminFetch("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          storeName: storeName.trim(),
          tagline: tagline.trim(),
          whatsappDisplayNumber: whatsappDisplayNumber.trim() || null,
          supportEmail: supportEmail.trim() || null,
          supportPhone: supportPhone.trim() || null,
          businessAddress: businessAddress.trim() || null,
          freeShippingThresholdInPaise: rupeesToPaise(Number(freeShipping) || 0),
          standardShippingInPaise: rupeesToPaise(
            Number(standardShipping) || 0,
          ),
          instagramUrl: instagramUrl.trim() || null,
          facebookUrl: facebookUrl.trim() || null,
          isStoreOpen,
          announcementText: announcementText.trim() || null,
        }),
      });
      setSuccess("Settings saved.");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(
        err instanceof AdminApiError ? err.message : "Could not save settings",
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      {error ? (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      ) : null}
      {success ? (
        <p className="text-sm text-[var(--color-success)]">{success}</p>
      ) : null}

      <section className="admin-card grid gap-4 p-4 md:grid-cols-2 md:p-5">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="storeName">Store name</Label>
          <Input
            id="storeName"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wa">WhatsApp display number</Label>
          <Input
            id="wa"
            value={whatsappDisplayNumber}
            onChange={(e) => setWhatsappDisplayNumber(e.target.value)}
            placeholder="9198XXXXXXXX"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="supportPhone">Support phone</Label>
          <Input
            id="supportPhone"
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="supportEmail">Support email</Label>
          <Input
            id="supportEmail"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="address">Business address</Label>
          <Textarea
            id="address"
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="freeShip">Free shipping threshold (₹)</Label>
          <Input
            id="freeShip"
            type="number"
            min={0}
            step="0.01"
            value={freeShipping}
            onChange={(e) => setFreeShipping(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stdShip">Standard shipping (₹)</Label>
          <Input
            id="stdShip"
            type="number"
            min={0}
            step="0.01"
            value={standardShipping}
            onChange={(e) => setStandardShipping(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ig">Instagram URL</Label>
          <Input
            id="ig"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fb">Facebook URL</Label>
          <Input
            id="fb"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="announcement">Announcement</Label>
          <Input
            id="announcement"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={isStoreOpen}
            onChange={(e) => setIsStoreOpen(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-rose-gold)]"
          />
          Store is open for orders
        </label>
      </section>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
