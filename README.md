# VisionPipe3D

Hand tracking and gesture recognition platform built with Next.js, MediaPipe, and Three.js.

**Live**: [visionpipe3d.quochuy.dev](https://visionpipe3d.quochuy.dev)

## Features

- **Playground** - Interactive hand tracking demo with 3D text control
- **Cloud API** - API keys for integrating hand tracking into your apps
- **Documentation** - Guides and sample projects
- **Blog** - Updates, showcases, and announcements

## Tech Stack

- Next.js 16 / React 19
- TypeScript
- Tailwind CSS v4
- Clerk (authentication)
- Drizzle ORM + PostgreSQL
- Stripe (payments)
- Fumadocs (documentation)
- MediaPipe (hand tracking)
- Three.js (3D rendering)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account
- Stripe account (for payments)

### Installation

```bash
cd web

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your Clerk, Stripe, and database credentials

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
│   └── lib/           # Utilities (auth, stripe, api-keys)
├── content/
│   └── docs/          # Documentation (MDX)
└── public/            # Static assets
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/playground` | Hand tracking demo (requires credits) |
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

New users receive 3 free credits. Each playground session uses 1 credit.

## Contact

Email: quochuy.dev@gmail.com

## License

MIT
