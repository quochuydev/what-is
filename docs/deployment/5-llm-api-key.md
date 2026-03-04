# Step 5: Get an LLM API Key

## Overview

what-is uses an OpenAI-compatible API to generate definitions. By default it's configured for [DeepSeek](https://platform.deepseek.com), but any OpenAI-compatible provider works.

## Option A: DeepSeek (Default)

1. Sign up at [platform.deepseek.com](https://platform.deepseek.com)
2. Go to **API Keys** and create a new key
3. Add credits to your DeepSeek account

```
LLM_API_KEY=your-deepseek-api-key
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
```

## Option B: OpenAI

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to **API Keys** and create a new key
3. Add credits to your OpenAI account

```
LLM_API_KEY=sk-your-openai-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

## Option C: Any OpenAI-Compatible Provider

The app uses the `openai` npm package, so any provider with an OpenAI-compatible API works:

| Provider | Base URL | Model Example |
|----------|----------|---------------|
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.1-8b-instant` |
| Together | `https://api.together.xyz/v1` | `meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo` |
| OpenRouter | `https://openrouter.ai/api/v1` | `anthropic/claude-3-haiku` |

## Cost Estimation

Each definition lookup uses ~200 tokens (input + output). Rough cost per lookup:

| Provider | Model | Cost per 1K lookups |
|----------|-------|---------------------|
| DeepSeek | deepseek-chat | ~$0.03 |
| OpenAI | gpt-4o-mini | ~$0.05 |
| Groq | llama-3.1-8b | ~$0.01 |

Your margin depends on which package users buy ($0.67–$1.00 per lookup).

## Environment Variables

Save these values — you'll need them in Step 6:

```
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
```

## Next Step

[Step 6: Deploy to Vercel](./6-deploy-to-vercel.md)
