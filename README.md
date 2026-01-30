# what-is

AI-powered definition lookup service built with Next.js.

## Features

- **Playground** - Look up definitions for any keyword using AI
- **Cloud API** - API keys for integrating definition lookups into your apps
- **Documentation** - Guides and sample projects
- **Blog** - Updates, showcases, and announcements

## Tech Stack

- Next.js 16 / React 19
- TypeScript
- Tailwind CSS v4
- Clerk (authentication)
- Drizzle ORM + PostgreSQL
- PayPal (payments)
- Fumadocs (documentation)
- OpenAI-compatible API (definitions)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account
- PayPal account (for payments)
- OpenAI-compatible API key (e.g., DeepSeek)

### Installation

```bash
cd web

# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env
# Fill in your Clerk, PayPal, LLM, and database credentials

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
web/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── db/            # Database schema and connection
│   └── lib/           # Utilities (auth, paypal, api-keys)
├── content/
│   └── docs/          # Documentation (MDX)
└── public/            # Static assets
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/playground` | AI definition lookup (requires credits) |
| `/docs` | Documentation |
| `/blog` | Blog posts |
| `/pricing` | Pricing plans |
| `/cloud` | Cloud API landing |
| `/c/cloud/api-keys` | Manage API keys |
| `/c/cloud/billing` | Credits and billing |

## Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Run ESLint
npm run db:push    # Push schema to database
npm run db:studio  # Open Drizzle Studio
```

## Credits System

Each definition lookup uses 1 credit. Purchase credits via PayPal:

- Starter: $1 for 1 credit
- Growth: $5 for 6 credits
- Scale: $20 for 30 credits

## Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=

# JWT
JWT_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox

# LLM (OpenAI-compatible)
LLM_API_KEY=
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
```

## Contact

Email: quochuy.dev@gmail.com

## License

MIT
