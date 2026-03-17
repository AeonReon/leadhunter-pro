# LeadHunter · Deploy Guide
## Everything in Vercel — no external database needed

---

## STEP 1 — Push files to GitHub (2 minutes)

1. Go to **github.com** → sign in → click **New** (top left)
2. Name it `leadhunter` → click **Create repository**
3. Click **Add file → Upload files**
4. Upload ALL of these files (keep the `api` folder structure):
   ```
   index.html
   manifest.json
   vercel.json
   package.json
   api/leads.js
   api/search.js
   ```
   > On mobile: tap the folder icon to upload files, or create the `api` folder first then upload the .js files into it

---

## STEP 2 — Deploy on Vercel (3 minutes)

1. Go to **vercel.com** → sign in with GitHub
2. Click **Add New Project** → select your `leadhunter` repo → click **Deploy**
3. Wait ~1 minute — it'll give you a live URL like `leadhunter-abc123.vercel.app`

---

## STEP 3 — Add your SERPAPI key (1 minute)

1. In Vercel, go to your project → **Settings → Environment Variables**
2. Add one variable:
   - **Name:** `SERPAPI_KEY`
   - **Value:** your SERPAPI key (from serpapi.com)
3. Click **Save** → then go to **Deployments → Redeploy** (so it picks up the new key)

---

## STEP 4 — Add the database (2 clicks)

This is the "one click" part:

1. In Vercel, go to your project → **Storage** tab
2. Click **Create Database → KV**
3. Name it `leadhunter-kv` → click **Create & Connect**

That's it. Vercel automatically wires the database to your app — no passwords, no connection strings, nothing to copy.

---

## STEP 5 — Open the app

- Go to your Vercel URL on any device
- On iPhone: tap **Share → Add to Home Screen** to install as an app
- Search for businesses → results save automatically → never lost

---

## HOW IT WORKS

| Action | What happens |
|--------|-------------|
| Search "hair salons Coleraine" | Fetches from SERPAPI, saves all results to KV database |
| Search again next week | New results added, duplicates skipped automatically |
| Open on iPhone | Same library, fully synced |
| Move a lead to "Contacted" | Saved instantly to database |
| Export CSV | Downloads everything in a clean spreadsheet |

---

## NOTES

- **SERPAPI free plan** = 100 searches/month (~20 results each = 2,000 leads/month)
- **Vercel KV free plan** = 30,000 requests/month — plenty for this
- Both are free, no credit card needed for basic use
- Custom domain: Vercel → Settings → Domains → add `leads.realfastwebsite.com`
