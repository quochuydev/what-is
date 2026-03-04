# Step 2: Provision a PostgreSQL Database

## Overview

what-is uses PostgreSQL with Drizzle ORM. You need a hosted PostgreSQL instance accessible from Vercel's serverless functions.

## Setup

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project (e.g., `what-is`)
3. Select the region closest to your Vercel deployment
4. Copy the connection string from the dashboard

The connection string looks like:

```
postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require
```

## Environment Variable

Save this value — you'll need it in Step 6:

```
DATABASE_URL=postgresql://username:password@your-host/your-database?sslmode=require
```

This opens Drizzle Studio at `https://local.drizzle.studio` where you can browse your tables.

## Next Step

[Step 3: Set Up Clerk Authentication](./3-clerk-auth.md)
