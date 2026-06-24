# PriceScope — Render Deployment Guide

## What you need
- A **GitHub account** (free) → https://github.com
- A **Render account** (free) → https://render.com

No terminal. No CLI. No installs. Just browser + GitHub.

---

## Step 1 — Upload project to GitHub (3 min)

1. Go to **https://github.com/new**
2. Name the repo `pricescope`
3. Set it to **Public** (free accounts need public for static sites)
4. Click **Create repository**
5. On the next page, click **"uploading an existing file"**
6. Drag and drop ALL the files from the extracted zip:
   ```
   index.html
   render.yaml
   css/
   js/
   ```
7. Scroll down → click **"Commit changes"**

Your code is now on GitHub ✅

---

## Step 2 — Deploy on Render (2 min)

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → select **"Static Site"**
3. Click **"Connect GitHub"** → authorize Render → select your `pricescope` repo
4. Fill in the settings:

| Field | Value |
|-------|-------|
| Name | `pricescope` |
| Branch | `main` |
| Build Command | *(leave empty)* |
| Publish Directory | `.` |

5. Click **"Create Static Site"**

Render will deploy in about 30 seconds. You'll get a URL like:

```
https://pricescope.onrender.com
```

**Your site is live!** 🎉

---

## Step 3 — Custom domain (optional)

1. In Render dashboard → your site → **"Custom Domains"**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g. `pricescope.in`)
4. Add the CNAME record shown to your domain registrar
5. SSL is auto-managed and free ✅

---

## Updating the site later

1. Go to your GitHub repo
2. Click the file you want to edit → pencil icon ✏️
3. Make your changes → **"Commit changes"**
4. Render **auto-deploys** in ~30 seconds — no manual steps needed

---

## Render free tier limits

| Feature | Free tier |
|---------|-----------|
| Static sites | Unlimited |
| Bandwidth | 100 GB/month |
| Custom domain | ✅ Included |
| SSL certificate | ✅ Auto-managed |
| Auto-deploy from GitHub | ✅ Included |
| Spin-down on inactivity | ❌ Not applicable (static sites stay live 24/7) |

> ℹ️ The spin-down limitation only affects Render's **web services** (Node, Python backends).  
> Static sites like yours are **always on** with no delays.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Site shows blank page | Make sure `index.html` is at the root, not inside a subfolder |
| CSS/JS not loading | Check file paths — they should be `css/style.css` and `js/app.js` |
| Old version showing | Hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac) |
| Deploy failed | Check Render logs → click your site → "Logs" tab |
| GitHub not showing | Make sure repo is **Public**, not Private |
