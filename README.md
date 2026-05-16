# Leaked Sauce 🔥
Custom image host with Discord embeds for sauce.behindthebuybox.co.uk

---

## How it works
1. You upload an image via a POST request (or ShareX)
2. The server generates a short unique URL e.g. `sauce.behindthebuybox.co.uk/a3f9c2b1.png`
3. When pasted into Discord, it shows a custom embed with "Leaked Sauce" as the site name and your image

---

## Deploy to Railway (recommended — free tier available)

1. Go to **railway.app** and sign up with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Push this folder to a GitHub repo first, then connect it
4. Add these environment variables in Railway:
   - `UPLOAD_KEY` — a secret password only you know (e.g. `mysecretkey123`)
   - `BASE_URL` — `https://sauce.behindthebuybox.co.uk`
   - `PORT` — `3000`
5. Railway will give you a deployment URL — point your `sauce.behindthebuybox.co.uk` subdomain CNAME at it

---

## Uploading images

### Option 1 — ShareX (Windows) or similar
Set up a custom uploader with these settings:
- **URL:** `https://sauce.behindthebuybox.co.uk/upload`
- **Method:** POST
- **Headers:** `x-upload-key: your-secret-key`
- **Body:** Form data, field name `file`
- **URL response path:** `url`

### Option 2 — curl (Mac terminal)
```bash
curl -X POST https://sauce.behindthebuybox.co.uk/upload \
  -H "x-upload-key: your-secret-key" \
  -F "file=@/path/to/your/image.png"
```
It will return: `{"url":"https://sauce.behindthebuybox.co.uk/a3f9c2b1.png"}`
Paste that URL into Discord and the embed appears.

### Option 3 — Scriptable (iPhone shortcut)
Can be set up to share images directly from your camera roll.

---

## Supported file types
- Images: JPG, PNG, GIF, WebP
- Video: MP4 (up to 20MB)

---

## Security
- Only requests with the correct `x-upload-key` header can upload
- Anyone with the link can view — by design (it's for sharing in Discord)
- Keep your UPLOAD_KEY secret
