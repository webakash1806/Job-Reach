# Job Outreach

Two parts:

| Folder | What it is |
| --- | --- |
| `extension/` | Chrome extension. Searches LinkedIn posts by keyword and date, skips posts that mention words you exclude (e.g. `python, java`), auto-scrolls, pulls out emails and sends them to the dashboard. |
| `dashboard/` | Next.js + shadcn/ui + MongoDB. Stores contacts, your CVs and templates, sends bulk email over your SMTP on a schedule, never emails anyone twice, sends follow-ups as replies in the same thread and detects replies over IMAP. |

The dashboard runs as **two processes**: the web app and a **worker** (`worker/index.ts`) that sends queued mail every 15 s, queues automatic follow-ups every 5 min and checks inboxes every 10 min. Emails only go out while the worker is running.

## 1. Set up MongoDB Atlas

1. Create a free cluster at cloud.mongodb.com.
2. Database Access: add a user. Network Access: allow your server's IP (or `0.0.0.0/0` while testing).
3. Connect, Drivers: copy the `mongodb+srv://...` string and add a database name, e.g. `/job_outreach`.

## 2. Configure

```powershell
cd dashboard
copy .env.example .env
```

Fill in `.env`:

- `MONGODB_URI`: your Atlas string
- `JWT_SECRET`, `ENCRYPTION_KEY`: long random strings (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Do not change `ENCRYPTION_KEY` later, or saved SMTP passwords stop decrypting.
- `ADMIN_EMAIL=itsakash18.06@gmail.com` and `ADMIN_PASSWORD`: the admin account is created on the first login. Only this account can create, disable or delete users. There is no public sign-up.
- `NEXT_PUBLIC_APP_URL`: the public URL. If it starts with `https://`, the login cookie is marked Secure.

For local development, put the same values in `dashboard/.env.local`. The one in the folder now points at a throwaway test database, so replace `MONGODB_URI` with your Atlas string.

## 3a. Run with Docker (production)

```powershell
cd dashboard
docker compose up -d --build
```

This starts `web` on port 3000 and `worker` next to it. Both use `.env`. Put a reverse proxy with HTTPS (Caddy, Nginx, Traefik) in front of port 3000 on your VPS. Logs: `docker compose logs -f worker`.

### VPS + Nginx + domain + SSL (Ubuntu/Debian)

1. **DNS**: at your domain registrar, add an `A` record for `example.com` (or `app.example.com`) pointing to the VPS IP. Wait until `ping example.com` shows that IP.
2. **Install** (on the VPS, as a sudo user):
   ```bash
   curl -fsSL https://get.docker.com | sudo sh
   sudo apt install -y nginx certbot python3-certbot-nginx
   sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
   ```
3. **App**: copy the `dashboard` folder to the server (`git clone`, or `scp -r dashboard user@IP:~/`), then:
   ```bash
   cd ~/dashboard
   cp .env.example .env && nano .env   # set NEXT_PUBLIC_APP_URL=https://example.com
   sudo docker compose up -d --build
   curl -I http://127.0.0.1:3000/login   # should return 200
   ```
   The compose file binds port 3000 to localhost only, so the app is reachable only through Nginx.
   In MongoDB Atlas > Network Access, allow the VPS IP.
4. **Nginx**:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/job-outreach
   sudo sed -i 's/example.com/YOUR_DOMAIN/' /etc/nginx/sites-available/job-outreach
   sudo ln -s /etc/nginx/sites-available/job-outreach /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t && sudo systemctl reload nginx
   ```
5. **SSL** (free Let's Encrypt cert; adds the HTTPS block and the HTTP-to-HTTPS redirect, auto-renews):
   ```bash
   sudo certbot --nginx -d YOUR_DOMAIN --redirect -m you@example.com --agree-tos
   sudo certbot renew --dry-run
   ```
6. **Extension**: set Dashboard URL to `https://YOUR_DOMAIN` in the popup (or `config.json`).

Update later: `git pull && sudo docker compose up -d --build`.

Images are built from one multi-stage `Dockerfile`: `--target web` gives the Next.js standalone server, `--target worker` gives the sender. On Render or Railway, create a Web Service and a Background Worker from the same repo with those two targets. The web image also needs the `extension/` folder (compose passes it as an extra build context); with plain `docker build` add `--build-context extension=../extension`, or set `EXTENSION_DIR` to wherever the extension files live.

## 3b. Run without Docker (development)

```powershell
cd dashboard
npm install
npm run dev
```

In a second terminal:

```powershell
npm run worker
```

## 4. First-time setup in the dashboard

1. Sign in as the admin. Create other users under **Admin, Users** if needed.
2. **Settings, SMTP**: for Gmail, turn on 2-step verification and create an App Password (myaccount.google.com/apppasswords). Click **Use Gmail defaults** (`smtp.gmail.com:465` SSL), enter your address and the app password, then **Send test email**.
3. **Settings, Reply detection**: switch on, `imap.gmail.com:993`. Leave the password empty to reuse the SMTP app password. Click **Test connection**.
4. **Resumes**: upload your CV (PDF/DOCX, up to 5 MB, stored in MongoDB GridFS). The first upload becomes the default.
5. **Templates**: create a first-email template and a follow-up template. Variables: `{{first_name}}`, `{{name}}`, `{{company}}`, `{{email}}`.
6. **Extension** (sidebar): follow the install guide below.

## 5. Install the extension (no Chrome Web Store needed)

Each user installs it from the dashboard's **Extension** page, which walks through these steps and shows a live **Connected** check:

1. **Download extension**: the zip is built for that user and already contains the dashboard URL and their API key, so nothing needs pasting.
2. Right-click the zip, **Extract All**, and keep the folder somewhere permanent (Chrome runs it from there).
3. Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
4. **Load unpacked**, then pick the folder that contains `manifest.json`.
5. Pin it and open it once. The popup says *Connected as you@...* and the dashboard page turns green.

To update later: download again, replace the files in the same folder, and click the reload icon on the extension. The Extension page warns when a newer version is available. If a user regenerates their API key in Settings, they download again (or paste the new key in the popup's Setup tab).

When the extension is installed straight from the `extension/` source folder (developers), there is no `config.json`, so paste the URL and key from the Extension page into the popup's **Setup** tab.

Using the extension, **Search** tab: one search per line (e.g. `hiring react developer`), **Skip posts that mention** (`python, java`), optionally **Only keep posts that mention**, choose **Posted** (24 h / week / month), then **Start**.

While it runs, posts with emails get a green outline and skipped posts a dashed red one. Found emails are saved in the dashboard right away, and are kept and retried locally if the dashboard is unreachable. The **Found** tab can export a CSV. Exclusion uses whole words, so `java` does not skip `javascript` posts.

## 6. Send

- **Contacts**: search and filter, select rows, then **Email N**. Or go to **Campaigns, New campaign** and choose **All new contacts**.
- Pick a template and CV, a start time, the gap between emails (**Fixed**, or **Random** between a min and max), a daily cap and sending hours. The summary shows how many contacts are skipped because they were already emailed.
- Optional **Automatic follow-up**: after N days without a reply, sends the follow-up template as `Re: <subject>` in the same thread, up to N times.
- **Campaign page**: pause, resume (the remaining emails are rescheduled from now) or cancel.
- **Sent**: history, scheduled and failed emails (retry), plus **Follow up** per row. **Follow-ups**: everyone without a reply after N days, ready for bulk follow-ups.

### How duplicate sending is prevented

- Contacts are unique per user and email (MongoDB unique index), so the extension and CSV imports can't create duplicates.
- When a campaign is created, anyone with a sent or queued first email (or marked sent, replied or bounced) is skipped.
- The worker checks again right before each send and cancels the job if that person was already emailed.

## Notes

- Gmail allows about 500 emails per day on a normal account. Keep the daily cap well below that and use random gaps.
- Automated scrolling of LinkedIn goes against LinkedIn's terms. The extension only reads what your logged-in browser shows, at a human pace, but keep runs modest to protect your account.
- LinkedIn changes its page markup often. If the extension stops finding posts, the selectors are at the top of `extension/content.js` (`POST_SELECTORS`).
# Job-Reach
