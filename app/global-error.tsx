"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "Georgia, serif",
          background: "#F7EFE5",
          color: "#35251F",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h1>ZAVÉLIA</h1>
          <p>We could not load the store right now.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              padding: "10px 16px",
              background: "#35251F",
              color: "#fff",
              border: 0,
            }}
          >
            Try again
          </button>
          <pre style={{ display: "none" }}>{error.message}</pre>
        </div>
      </body>
    </html>
  );
}
