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
    slug: "introducing-visionpipe3d",
    title: "Introducing VisionPipe3D",
    excerpt:
      "Real-time hand tracking meets Three.js for gesture-controlled 3D experiences.",
    category: "announcement",
    date: "2024-01-15",
    image: "https://placehold.co/400x300/1a1a2e/ffffff?text=VisionPipe3D",
  },
  {
    slug: "hand-tracking-demo",
    title: "Hand Tracking Demo",
    excerpt: "See how VisionPipe3D tracks 21 hand landmarks in real-time.",
    category: "showcase",
    date: "2024-01-10",
    image: "https://placehold.co/400x300/16213e/ffffff?text=Demo",
  },
  {
    slug: "v1-release",
    title: "Version 1.0 Released",
    excerpt: "We're excited to announce the stable release of VisionPipe3D.",
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
