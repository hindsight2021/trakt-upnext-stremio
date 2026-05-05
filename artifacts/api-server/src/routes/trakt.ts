import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const TRAKT_CLIENT_ID = process.env["TRAKT_CLIENT_ID"]!;
const TRAKT_CLIENT_SECRET = process.env["TRAKT_CLIENT_SECRET"]!;
const TRAKT_API_BASE = "https://api.trakt.tv";

function getRedirectUri(req: { protocol: string; get: (h: string) => string | undefined }): string {
  if (process.env["TRAKT_REDIRECT_URI"]) {
    return process.env["TRAKT_REDIRECT_URI"];
  }
  const domains = process.env["REPLIT_DOMAINS"];
  if (domains) {
    const primary = domains.split(",")[0]!.trim();
    return `https://${primary}/api/trakt/callback`;
  }
  const host = req.get("host") ?? "localhost";
  return `${req.protocol}://${host}/api/trakt/callback`;
}

router.get("/trakt/auth", async (req, res): Promise<void> => {
  const redirectUri = getRedirectUri(req);
  const url = new URL("https://trakt.tv/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", TRAKT_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  res.redirect(url.toString());
});

router.get("/trakt/callback", async (req, res): Promise<void> => {
  const code = req.query["code"];
  if (typeof code !== "string" || !code) {
    res.status(400).json({ error: "Missing authorization code" });
    return;
  }

  const redirectUri = getRedirectUri(req);

  const tokenRes = await fetch(`${TRAKT_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "TraktUpNext/1.0 (Stremio Addon)",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      code,
      client_id: TRAKT_CLIENT_ID,
      client_secret: TRAKT_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    req.log.error({ status: tokenRes.status, body: text }, "Trakt token exchange failed");
    res.status(502).json({ error: "Token exchange failed" });
    return;
  }

  const token = (await tokenRes.json()) as { access_token: string };
  const accessToken = token.access_token;

  const domains = process.env["REPLIT_DOMAINS"];
  const host = domains ? `https://${domains.split(",")[0]!.trim()}` : `${req.protocol}://${req.get("host")}`;
  const encodedToken = Buffer.from(accessToken).toString("base64url");
  const addonUrl = `${host}/api/stremio/${encodedToken}/manifest.json`;

  req.log.info("Trakt OAuth complete, redirecting to setup page with addon URL");
  res.redirect(`/?addon=${encodeURIComponent(addonUrl)}`);
});

export default router;
