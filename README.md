# what-is

**A ready-to-ship website boilerplate with payments, authentication, documentation, and blog built in.** Clone it, customize your service, and start selling.

## Why what-is?

Building a SaaS from scratch means wiring up auth, payments, docs, blog, dashboards, API keys — before you even start on your actual product.

what-is gives you all of that out of the box. Just swap in your own service, pricing, and content.

**Currently configured as an AI-powered definition lookup service** — but it's designed to be replaced with whatever you want to sell.

## What's Included

| Feature | Status | Details |
|---------|--------|---------|
| Authentication | Ready | Google OAuth via Clerk, user sync to DB |
| Payments | Ready | PayPal checkout, credit system, transaction history |
| API Key Management | Ready | Generate, revoke, audit log, usage tracking |
| Documentation | Ready | MDX-based docs with Fumadocs |
| Blog | Ready | Category filtering, individual post pages |
| Pricing Page | Ready | Credit packages with per-unit pricing |
| User Dashboard | Ready | API keys, usage stats, billing & credits |
| Landing Page | Ready | Hero, features, stats, CTA sections |
| Legal Pages | Ready | Privacy policy, terms of service |
| SEO | Ready | OpenGraph, structured data, sitemap, robots.txt, llms.txt |

## How to Use This Boilerplate

1. **Clone** this repo
2. **Replace the service** — swap the playground/query API with your own logic
3. **Update pricing** — edit credit packages in `src/lib/paypal.ts`
4. **Update content** — landing page, docs, blog posts, legal pages
5. **Deploy** — follow the [deployment guide](./docs/deployment/1-github-repo.md)

Everything else (auth, payments, API keys, dashboards) works as-is.

## Tech Stack

- Next.js 16 / React 19
- TypeScript
- Tailwind CSS v4
- Clerk (authentication)
- Drizzle ORM + PostgreSQL (Neon)
- PayPal (payments — works with personal accounts)
- OpenAI-compatible API (DeepSeek, OpenAI, Groq, etc.)

## Project Structure

```
web/
├── src/app/                  # Next.js App Router
│   ├── (public pages)        # /, /blog, /pricing, /docs, /playground
│   ├── c/cloud/              # Protected dashboard (api-keys, usage, billing)
│   ├── api/                  # API routes (keys, billing, playground, usage)
│   └── login/                # Clerk sign-in
├── src/components/           # Shared UI components
├── src/db/                   # Drizzle schema & database
├── src/lib/                  # Auth, PayPal, JWT, config utilities
├── content/docs/             # MDX documentation pages
└── public/                   # Static assets
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/docs` | Documentation (Fumadocs) |
| `/blog` | Blog with category filter |
| `/pricing` | Pricing page |
| `/playground` | Demo / service interface |
| `/login` | Google OAuth sign-in |
| `/c/cloud/api-keys` | API key management |
| `/c/cloud/usage` | Usage dashboard |
| `/c/cloud/billing` | Billing & credit purchases |
| `/cloud` | Cloud landing page |
| `/about-us` | About page |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

## Quick Start

```bash
git clone https://github.com/quochuydev/what-is.git
cd what-is/web
npm install
cp .env.example .env
# Configure environment variables (see .env.example)
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Full 7-step Vercel deployment guide: [docs/deployment/](./docs/deployment/1-github-repo.md)

1. Push repo to GitHub
2. Provision PostgreSQL (Neon)
3. Set up Clerk authentication
4. Set up PayPal payments
5. Get an LLM API key
6. Deploy to Vercel
7. Push database schema

## Pricing (Default)

| Package | Credits | Price |
|---------|---------|-------|
| Starter | 1 | $1 |
| Growth | 6 | $5 |
| Scale | 30 | $20 |

Edit `CREDIT_PACKAGES` in `src/lib/paypal.ts` to change.

## Contact

- Email: quochuy.dev@gmail.com
- GitHub: [github.com/quochuydev/what-is](https://github.com/quochuydev/what-is)

## License

MIT
