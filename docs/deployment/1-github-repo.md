# Step 1: Push Repo to GitHub

## Overview

Vercel deploys from a Git repository. You need your own copy on GitHub.

## Option A: Fork (recommended for contributing back)

1. Go to [github.com/quochuydev/what-is](https://github.com/quochuydev/what-is)
2. Click **Fork** in the top-right corner
3. Select your GitHub account as the destination

## Option B: Clone (for independent deployment)

```bash
git clone https://github.com/quochuydev/what-is.git
cd what-is

# Change remote to your own repo
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/what-is.git
git push -u origin main
```

## Verify

Your repo should have this structure:

```
what-is/
├── docs/
├── web/          ← This is the Next.js app
├── CLAUDE.md
├── README.md
└── .gitignore
```

The `web/` folder is the root directory you'll point Vercel to in Step 6.

## Next Step

[Step 2: Provision PostgreSQL Database](./2-postgresql-database.md)
