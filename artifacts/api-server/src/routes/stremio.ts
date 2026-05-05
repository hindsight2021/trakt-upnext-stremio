import { Router, type IRouter } from "express";

const router: IRouter = Router();

const TRAKT_API_BASE = "https://api.trakt.tv";
const TRAKT_CLIENT_ID = process.env["TRAKT_CLIENT_ID"]!;

const MANIFEST = {
  id: "community.trakt.upnext",
  version: "1.0.0",
  name: "Trakt Up Next",
  description: "Shows your unwatched released episodes from Trakt, sorted by latest release date.",
  types: ["series"],
  catalogs: [
    {
      type: "series",
      id: "trakt-upnext",
      name: "Up Next (Trakt)",
      extra: [],
    },
  ],
  resources: ["catalog"],
  idPrefixes: ["tt"],
};

function decodeToken(encoded: string): string {
  return Buffer.from(encoded, "base64url").toString("utf8");
}

async function traktGet(path: string, accessToken: string) {
  const res = await fetch(`${TRAKT_API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "TraktUpNext/1.0 (Stremio Addon)",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Trakt API error: ${res.status} ${path}`);
  }
  return res.json();
}

interface TraktShow {
  title: string;
  year: number;
  ids: { trakt: number; imdb?: string; tvdb?: number; slug: string };
}

interface TraktEpisode {
  season: number;
  number: number;
  title: string;
  first_aired: string | null;
  ids: { trakt: number; imdb?: string; tvdb?: number };
}

interface TraktUpNextEntry {
  show: TraktShow;
  next_episode: TraktEpisode | null;
  last_watched_at: string;
}

interface TraktIMDbRating {
  rating: number | null;
}

async function getUpNextEpisodes(accessToken: string): Promise<object[]> {
  const data = (await traktGet("/users/me/watched/shows?extended=noseasons", accessToken)) as Array<{
    show: TraktShow;
    last_watched_at: string;
  }>;

  const today = new Date();

  const enriched: TraktUpNextEntry[] = [];

  await Promise.allSettled(
    data.slice(0, 80).map(async (entry) => {
      try {
        const progress = (await traktGet(
          `/shows/${entry.show.ids.slug}/progress/watched`,
          accessToken,
        )) as { next_episode: TraktEpisode | null };

        const nextEp = progress.next_episode;
        if (!nextEp || !nextEp.first_aired) return;

        const airDate = new Date(nextEp.first_aired);
        if (airDate > today) return;

        enriched.push({
          show: entry.show,
          next_episode: nextEp,
          last_watched_at: entry.last_watched_at,
        });
      } catch {
        // skip shows that fail
      }
    }),
  );

  enriched.sort((a, b) => {
    const aDate = a.next_episode?.first_aired ?? "";
    const bDate = b.next_episode?.first_aired ?? "";
    return bDate.localeCompare(aDate);
  });

  return enriched.map((entry) => {
    const show = entry.show;
    const ep = entry.next_episode!;
    const imdbId = show.ids.imdb ?? `trakt:${show.ids.trakt}`;
    const episodeLabel = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
    const airDateStr = ep.first_aired ? new Date(ep.first_aired).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";

    const meta: Record<string, unknown> = {
      id: imdbId,
      type: "series",
      name: show.title,
      description: `${episodeLabel}${ep.title ? ` — ${ep.title}` : ""}${airDateStr ? `\nAired: ${airDateStr}` : ""}`,
      releaseInfo: String(show.year ?? ""),
    };

    if (show.ids.imdb) {
      meta["poster"] = `https://images.metahub.space/poster/medium/${show.ids.imdb}/img`;
      meta["background"] = `https://images.metahub.space/background/medium/${show.ids.imdb}/img`;
      meta["logo"] = `https://images.metahub.space/logo/medium/${show.ids.imdb}/img`;
    }

    return meta;
  });
}

router.get("/stremio/:token/manifest.json", (_req, res): void => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.json(MANIFEST);
});

router.get("/stremio/:token/catalog/series/trakt-upnext.json", async (req, res): Promise<void> => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  const rawToken = Array.isArray(req.params["token"]) ? req.params["token"][0]! : req.params["token"]!;

  let accessToken: string;
  try {
    accessToken = decodeToken(rawToken);
  } catch {
    res.status(400).json({ error: "Invalid token" });
    return;
  }

  try {
    const metas = await getUpNextEpisodes(accessToken);
    res.json({ metas });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch Trakt up next episodes");
    res.status(502).json({ error: "Failed to fetch episodes from Trakt" });
  }
});

router.options("/stremio/:token/{*splat}", (_req, res): void => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.sendStatus(200);
});

export default router;
