"use client";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-[var(--color-espresso)]/40"
        onClick={() => !loading && onOpenChange(false)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="relative z-10 w-[min(92vw,28rem)] rounded-lg border border-[var(--admin-border)] bg-[#fffefb] p-5 shadow-xl"
      >
        <h2
          id="confirm-title"
          className="admin-brand text-xl text-[var(--color-espresso)]"
        >
          {title}
        </h2>
        <p
          id="confirm-desc"
          className="mt-2 text-sm leading-relaxed text-[var(--color-espresso)]/70"
        >
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={loading}
            onClick={async () => {
              await onConfirm();
            }}
          >
            {loading ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
