import { useEffect, useState } from "react";

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getAddonUrlFromQuery(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("addon");
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#22c55e" />
      <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TraktIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#ED1C24" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="sans-serif">t</text>
    </svg>
  );
}

function StremioIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#7b5ea7" />
      <polygon points="18,14 36,24 18,34" fill="white" />
    </svg>
  );
}

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) return <CheckIcon />;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function SetupSuccess({ addonUrl }: { addonUrl: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(addonUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const stremioUrl = `stremio://${addonUrl.replace(/^https?:\/\//, "")}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #0f0f14 0%, #1a1a2e 100%)" }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TraktIcon />
            <span style={{ color: "#555", fontSize: 22 }}>+</span>
            <StremioIcon />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">You're connected!</h1>
          <p style={{ color: "#8b8b9e" }} className="text-base">
            Your personal Trakt Up Next addon is ready. Add it to Stremio to see your unwatched released episodes.
          </p>
        </div>

        <div style={{ background: "#16161f", border: "1px solid #2a2a3a", borderRadius: 16 }} className="p-6 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckIcon />
            <span className="font-semibold text-white">Addon URL</span>
          </div>
          <p style={{ color: "#8b8b9e", fontSize: 13 }} className="mb-3">
            This URL is unique to your Trakt account. Keep it private.
          </p>
          <div style={{ background: "#0d0d14", border: "1px solid #2a2a3a", borderRadius: 10 }} className="p-3 flex items-start gap-3">
            <code style={{ color: "#a78bfa", fontSize: 12, wordBreak: "break-all", flex: 1, lineHeight: 1.6 }}>
              {addonUrl}
            </code>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? "#16a34a22" : "#2a2a3a",
                border: "1px solid " + (copied ? "#16a34a55" : "#3a3a4a"),
                borderRadius: 8,
                color: copied ? "#22c55e" : "#a0a0b0",
                cursor: "pointer",
                padding: "6px 8px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                transition: "all 0.15s",
              }}
              title="Copy URL"
            >
              <CopyIcon copied={copied} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div style={{ background: "#16161f", border: "1px solid #2a2a3a", borderRadius: 16 }} className="p-6 mb-5">
          <p className="font-semibold text-white mb-4">How to install in Stremio</p>
          <ol className="space-y-3">
            {[
              "Open Stremio on any device",
              'Go to the "Addons" section',
              'Click "Community Addons" then paste the URL above in the search bar, or click the button below',
              "Click Install — your Up Next catalog will appear immediately",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  style={{
                    background: "#7b5ea722",
                    border: "1px solid #7b5ea755",
                    color: "#a78bfa",
                    borderRadius: "50%",
                    width: 26,
                    height: 26,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: "#c0c0d0", fontSize: 14, lineHeight: 1.6 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <a
          href={stremioUrl}
          style={{
            display: "block",
            textAlign: "center",
            background: "linear-gradient(135deg, #7b5ea7, #a855f7)",
            color: "white",
            padding: "14px 24px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 16,
            textDecoration: "none",
            marginBottom: 12,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Open in Stremio
        </a>

        <button
          onClick={() => {
            window.location.href = `${getBasePath()}/api/trakt/auth`;
          }}
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            background: "transparent",
            border: "1px solid #2a2a3a",
            color: "#8b8b9e",
            padding: "12px 24px",
            borderRadius: 12,
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3a3a4a";
            e.currentTarget.style.color = "#c0c0d0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#2a2a3a";
            e.currentTarget.style.color = "#8b8b9e";
          }}
        >
          Reconnect a different Trakt account
        </button>
      </div>
    </div>
  );
}

function SetupLanding() {
  const basePath = getBasePath();

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #0f0f14 0%, #1a1a2e 100%)" }}>
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <TraktIcon />
          <span style={{ color: "#555", fontSize: 26 }}>×</span>
          <StremioIcon />
        </div>

        <h1 className="text-4xl font-bold text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
          Trakt Up Next
        </h1>
        <p style={{ color: "#8b8b9e" }} className="text-base mb-8 leading-relaxed">
          A Stremio addon that shows your unwatched released episodes from Trakt, sorted by latest air date. Only episodes that are out — nothing spoilery.
        </p>

        <div style={{ background: "#16161f", border: "1px solid #2a2a3a", borderRadius: 16 }} className="p-5 mb-6 text-left">
          <ul className="space-y-3">
            {[
              "Reads your Trakt watch history",
              "Finds the next unwatched episode for each show",
              "Filters out future/unaired episodes",
              "Sorted by most recently aired first",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <CheckIcon />
                <span style={{ color: "#c0c0d0", fontSize: 14 }}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <a
          href={`${basePath}/api/trakt/auth`}
          style={{
            display: "block",
            background: "linear-gradient(135deg, #ED1C24, #ff4444)",
            color: "white",
            padding: "16px 24px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 17,
            textDecoration: "none",
            marginBottom: 12,
            transition: "opacity 0.15s",
            boxShadow: "0 4px 24px rgba(237,28,36,0.3)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Connect with Trakt
        </a>

        <p style={{ color: "#555", fontSize: 12 }}>
          You'll be redirected to Trakt to authorize access. No data is stored on our servers.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [addonUrl, setAddonUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = getAddonUrlFromQuery();
    if (url) setAddonUrl(url);
  }, []);

  if (addonUrl) return <SetupSuccess addonUrl={addonUrl} />;
  return <SetupLanding />;
}
