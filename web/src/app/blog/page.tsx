"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const categories = [
  { id: "showcase", label: "Showcase" },
  { id: "release", label: "Release" },
  { id: "announcement", label: "Announcement" },
];

const blogPosts = [
  {
    slug: "introducing-what-is",
    title: "Introducing what-is",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    category: "announcement",
    date: "2024-01-15",
    image: "https://placehold.co/400x300/1a1a2e/ffffff?text=what-is",
  },
  {
    slug: "ai-definitions-demo",
    title: "AI Definitions Demo",
    excerpt:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    category: "showcase",
    date: "2024-01-10",
    image: "https://placehold.co/400x300/16213e/ffffff?text=Demo",
  },
  {
    slug: "v1-release",
    title: "Version 1.0 Released",
    excerpt:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    category: "release",
    date: "2024-01-05",
    image: "https://placehold.co/400x300/0f3460/ffffff?text=v1.0",
  },
];

function BlogContent() {
  const searchParams = useSearchParams();
  const selectedCategories = searchParams.get("categories")?.split(",") || [];

  const filteredPosts =
    selectedCategories.length > 0
      ? blogPosts.filter((post) => selectedCategories.includes(post.category))
      : blogPosts;

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>

      <div className="flex gap-8">
        {/* Categories Sidebar */}
        <aside className="w-48 shrink-0">
          <h2 className="mb-4 font-semibold">Categories</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/blog"
                className={`block rounded px-3 py-2 text-sm transition-colors hover:bg-accent ${
                  selectedCategories.length === 0 ? "bg-accent font-medium" : ""
                }`}
              >
                All
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/blog?categories=${cat.id}`}
                  className={`block rounded px-3 py-2 text-sm transition-colors hover:bg-accent ${
                    selectedCategories.includes(cat.id)
                      ? "bg-accent font-medium"
                      : ""
                  }`}
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Blog Grid */}
        <div className="flex-1">
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-xl border border-border transition-colors hover:bg-accent"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-4">
                  <span className="text-xs uppercase text-muted-foreground">
                    {post.category}
                  </span>
                  <h3 className="mt-1 font-semibold group-hover:underline">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <time className="mt-3 block text-xs text-muted-foreground">
                    {post.date}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-[1080px] px-4 py-12">Loading...</div>
          }
        >
          <BlogContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
