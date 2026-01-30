export async function GET() {
  const content = `# what-is

> AI-powered definition lookup service. Get instant, accurate definitions for any keyword.

## Overview

what-is is an AI-powered definition lookup service that provides instant, accurate definitions for any keyword using advanced language models.

## Website

https://example.com

## Features

- **AI-Powered Definitions**: Get accurate definitions using advanced language models
- **Instant Results**: Definitions generated in seconds
- **Cloud API**: Integrate definition lookups into your applications
- **Credit-based Billing**: Pay only for what you use

## Pages

### Home (/)
Landing page showcasing what-is capabilities.

### Documentation (/docs)
Comprehensive documentation for integrating what-is into your applications.

- Getting Started Guide
- Sample Projects
- FAQ
- Cloud API documentation (API Keys, Pricing)

### Blog (/blog)
Latest news, tutorials, and updates about what-is.

Categories:
- Showcase: Demo projects and implementations
- Release: Version announcements and changelogs
- Announcement: Company and product news

### Pricing (/pricing)
Credit-based pricing:

- Starter: $1 for 1 credit
- Growth: $5 for 6 credits
- Scale: $20 for 30 credits

### Playground (/playground)
Interactive demo where users can try definition lookups. Enter a keyword and get an instant AI-powered definition. Requires sign-in and uses credits (1 credit per lookup).

### Cloud (/cloud)
Landing page for what-is Cloud services.

### Station (/station)
Central hub for managing what-is configurations.

### About Us (/about-us)
Information about what-is.

Contact:
- Email: quochuy.dev@gmail.com
- GitHub: github.com/example/what-is

### Terms of Service (/terms)
Legal terms and conditions for using what-is services.

### Privacy Policy (/privacy)
Privacy policy explaining data collection and user rights.

## Cloud Dashboard (/c/cloud/*)

Authenticated area for managing cloud services:
- **API Keys** (/c/cloud/api-keys): Create and manage API keys
- **Usage** (/c/cloud/usage): View API usage statistics
- **Billing** (/c/cloud/billing): Manage billing and credits

## Technical Stack

- **Framework**: Next.js (App Router)
- **AI**: OpenAI-compatible API
- **Authentication**: Clerk
- **Payments**: PayPal
- **Documentation**: Fumadocs
- **Styling**: Tailwind CSS

## Keywords

definition, AI, lookup, dictionary, what is, meaning, explanation, knowledge

## Contact

For inquiries: quochuy.dev@gmail.com
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
