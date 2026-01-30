# what-is

**AI-powered definition lookup service.** Get instant, accurate definitions for any keyword.

## What is what-is?

what-is is a simple, fast definition lookup tool powered by AI. Enter any keyword and get a clear, concise explanation in seconds.

Perfect for:
- Students researching topics
- Writers needing quick definitions
- Developers building knowledge apps
- Anyone curious about the world

## Features

- **Instant Definitions** - Get accurate explanations in 2-3 sentences
- **Any Topic** - Science, technology, history, culture, and more
- **AI-Powered** - Uses advanced language models for quality results
- **Developer API** - Integrate definitions into your own applications
- **Simple Pricing** - Pay only for what you use, no subscriptions

## How It Works

1. **Sign up** - Create a free account with Google
2. **Get credits** - Purchase credits via PayPal
3. **Look up** - Enter a keyword in the Playground
4. **Get definition** - Receive an AI-generated definition instantly

Each lookup uses 1 credit.

## Pricing

No subscriptions. No monthly fees. Credits never expire.

| Package | Credits | Price | Per Lookup |
|---------|---------|-------|------------|
| **Starter** | 1 | $1 | $1.00 |
| **Growth** | 6 | $5 | $0.83 |
| **Scale** | 30 | $20 | $0.67 |

Need more? Contact us for enterprise pricing.

## API Access

Build definition lookups into your apps with our simple API:

```bash
curl -X POST https://example.com/api/playground/query \
  -H "Authorization: Bearer wi_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"keyword": "photosynthesis"}'
```

Response:
```json
{
  "keyword": "photosynthesis",
  "definition": "The process by which plants convert light energy into chemical energy, using carbon dioxide and water to produce glucose and oxygen.",
  "credits": 5
}
```

## Tech Stack

- Next.js 16 / React 19
- TypeScript
- Tailwind CSS v4
- Clerk (authentication)
- Drizzle ORM + PostgreSQL
- PayPal (payments)
- OpenAI-compatible API

## Self-Hosting

Want to run your own instance?

```bash
git clone https://github.com/quochuydev/what-is.git
cd what-is/web
npm install --legacy-peer-deps
cp .env.example .env
# Configure your environment variables
npm run db:push
npm run dev
```

See `.env.example` for required configuration.

## Contact

- Email: quochuy.dev@gmail.com
- GitHub: [github.com/quochuydev/what-is](https://github.com/quochuydev/what-is)

## License

MIT
