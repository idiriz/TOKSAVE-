# TokSave — Deploy to Render.com

## Your folder structure (required)

```
toksave/
├── public/
│   └── index.html       ← your frontend goes here
├── server.js
├── package.json
└── render.yaml
```

## Step 1 — Set up the folder

1. Create a folder called `toksave` on your computer
2. Inside it, create a folder called `public`
3. Put `index.html` inside `public/`
4. Put `server.js`, `package.json`, `render.yaml` in the root

## Step 2 — Push to GitHub

1. Go to https://github.com and create a free account (if you don't have one)
2. Click **New repository** → name it `toksave` → click **Create**
3. On your computer, open terminal in the `toksave` folder and run:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/toksave.git
git push -u origin main
```

Replace `YOURUSERNAME` with your GitHub username.

## Step 3 — Deploy on Render

1. Go to https://render.com and sign up free (use GitHub login)
2. Click **New** → **Web Service**
3. Click **Connect a repository** → select `toksave`
4. Render will auto-detect the `render.yaml` settings
5. Click **Create Web Service**
6. Wait ~2 minutes for the build to finish

## Step 4 — Your site is live!

Render gives you a free URL like:
```
https://toksave.onrender.com
```

That's it. Your frontend and backend are both running at that URL.

## Notes

- Free Render plan: the server "sleeps" after 15 min of inactivity
  and takes ~30 seconds to wake up on first visit.
  Upgrade to Render Starter ($7/mo) to keep it always on.

- To use a custom domain (e.g. toksave.com):
  1. Buy domain on Namecheap (~$10/yr)
  2. In Render → your service → Settings → Custom Domains → Add
  3. Follow the DNS instructions shown

## Test your API

Once live, test it with:
```
curl -X POST https://toksave.onrender.com/api/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.tiktok.com/@user/video/1234567890"}'
```
