## Web

`./web`

Strictly routers defined, must ask for confirm if add other new.

### Routers

```
domain.com/docs - documentation (fumadocs)
domain.com/docs/[...slug] - dynamic doc pages
domain.com/blog - left: Categories; right: Blogs grid. URL support params: blog?categories=showcase,release,announcement
domain.com/blog/[slug]
domain.com/pricing - Standard Plan/Enterprise Plan
domain.com/playground - Input keyword, get AI-powered definition
domain.com/c/*  - must authenticated
domain.com/c/cloud/api-keys - API Keys - Table/Add/Delete
domain.com/c/cloud/usage - Cloud Usage Dashboard - Table
domain.com/c/cloud/billing - Billing & Credits
domain.com/login?redirectTo=%2Fc%2Fcloud%2Fapi-keys - Clerk: Google
domain.com/cloud - a landing page with button redirect to /c/cloud/api-keys
domain.com/station
domain.com/about-us
domain.com/terms
domain.com/privacy
```

## Documentation

Docs are in `./web/content/docs/` using fumadocs-mdx:

```
Overview (/docs)
Getting Started (/docs/getting-started)
Sample Projects
  - Branch Opening (/docs/samples/branch-opening)
  - Video Introduction (/docs/samples/video-introduction)
FAQ (/docs/faq)
Cloud API
  - API Keys (/docs/cloud/api-keys)
  - Pricing (/docs/cloud/pricing)
```

## Pricing

**Apply for web page pricing; pricing in docs; API related to pricing**

- Starter - 1$ - 1 credits
- Growth - 5$ - 6 credits
- Scale - 20$ - 30 credits

## Domain

`https://example.com`
