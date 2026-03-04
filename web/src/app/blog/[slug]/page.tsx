import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { config } from "@/lib/config";

const blogPosts: Record<string, { title: string; content: string; category: string; date: string; image: string }> = {
  "introducing-what-is": {
    title: `Introducing ${config.site.name}`,
    content: `
      ${config.site.name} brings together the power of advanced language models with a simple, developer-friendly API.

      With ${config.site.name}, you can:
      - Get instant AI-powered definitions for any keyword
      - Integrate definition lookups into your applications
      - Use our credit-based billing system
      - Access comprehensive documentation and SDKs

      Get started today by checking out our documentation and playground.
    `,
    category: "announcement",
    date: "2024-01-15",
    image: `https://placehold.co/800x400/1a1a2e/ffffff?text=${encodeURIComponent(config.site.name)}`,
  },
  "playground-demo": {
    title: "Playground Demo",
    content: `
      Our playground demo showcases the capabilities of ${config.site.name}.

      The playground provides:
      - Instant keyword definition lookups
      - AI-powered accurate responses
      - Simple, intuitive interface
      - Real-time results

      Try it out in your browser — no setup required.
    `,
    category: "showcase",
    date: "2024-01-10",
    image: "https://placehold.co/800x400/16213e/ffffff?text=Demo",
  },
  "v1-release": {
    title: "Version 1.0 Released",
    content: `
      We're excited to announce the stable release of ${config.site.name} version 1.0!

      This release includes:
      - Stable Cloud API for definition lookups
      - Credit-based billing system
      - Interactive playground
      - Comprehensive documentation
      - TypeScript support

      Thank you to all our contributors and early adopters.
    `,
    category: "release",
    date: "2024-01-05",
    image: "https://placehold.co/800x400/0f3460/ffffff?text=v1.0",
  },
};

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-[1080px] px-4 py-12">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to Blog
          </Link>

          <img
            src={post.image}
            alt={post.title}
            className="mb-8 aspect-[2/1] w-full rounded-xl object-cover"
          />

          <span className="text-sm uppercase text-muted-foreground">
            {post.category}
          </span>
          <h1 className="mt-2 text-4xl font-bold">{post.title}</h1>
          <time className="mt-2 block text-sm text-muted-foreground">
            {post.date}
          </time>

          <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none whitespace-pre-line">
            {post.content}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
