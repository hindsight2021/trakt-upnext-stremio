# Trakt Up Next — Raspberry Pi Self-Hosting

Runs as a single Docker container. Uses ~50–80 MB RAM at idle.

## Requirements

- Raspberry Pi 4 (any RAM)
- Docker + Docker Compose installed
- Your Pi accessible at a fixed IP or hostname on your network

## Install Docker on Pi (if not already installed)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in
```

## Setup

**1. Clone or copy this project onto your Pi**

```bash
git clone <your-repo-url> trakt-upnext
cd trakt-upnext/deploy
```

Or copy the whole project folder to the Pi via `scp`:

```bash
scp -r /path/to/project pi@raspberrypi.local:~/trakt-upnext
```

**2. Create your `.env` file**

```bash
cp deploy/.env.example deploy/.env
nano deploy/.env
```

Fill in:
- `TRAKT_CLIENT_ID` and `TRAKT_CLIENT_SECRET` from your Trakt app at https://trakt.tv/oauth/applications
- `SESSION_SECRET` — any long random string (e.g. run `openssl rand -hex 32`)
- `TRAKT_REDIRECT_URI` — your Pi's IP + port, e.g. `http://192.168.1.100:7000/api/trakt/callback`

**3. Register the redirect URI in your Trakt app**

Go to https://trakt.tv/oauth/applications and add the same `TRAKT_REDIRECT_URI` value to your app's Redirect URIs list.

**4. Build and start**

```bash
cd ~/trakt-upnext
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build
```

The first build takes a few minutes. After that it starts in seconds.

**5. Connect your Trakt account**

Open a browser and go to:
```
http://YOUR_PI_IP:7000
```

Click **Connect with Trakt**, authorise, and you'll get your personal addon URL.

**6. Install in Stremio**

Paste the addon URL into Stremio → Addons → search bar, or click **Open in Stremio**.

---

## Management

```bash
# View logs
docker compose -f deploy/docker-compose.yml logs -f

# Stop
docker compose -f deploy/docker-compose.yml down

# Update (after pulling new code)
docker compose -f deploy/docker-compose.yml up -d --build
```

## Notes

- The container restarts automatically on reboot (`restart: unless-stopped`)
- Your Trakt token is encoded in the addon URL itself — nothing is stored on disk
- Memory usage at idle: ~50–80 MB
- CPU at idle: near zero
