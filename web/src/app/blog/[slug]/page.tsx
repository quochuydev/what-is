import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";

const blogPosts: Record<string, { title: string; content: string; category: string; date: string; image: string }> = {
  "introducing-visionpipe3d": {
    title: "Introducing VisionPipe3D",
    content: `
      VisionPipe3D brings together the power of MediaPipe's hand tracking with Three.js's 3D rendering capabilities.

      With VisionPipe3D, you can:
      - Track hands in real-time with 21 landmark points
      - Map hand movements to 3D object transformations
      - Build gesture-controlled interfaces
      - Create immersive touchless experiences

      Get started today by checking out our documentation and demo.
    `,
    category: "announcement",
    date: "2024-01-15",
    image: "https://placehold.co/800x400/1a1a2e/ffffff?text=VisionPipe3D",
  },
  "hand-tracking-demo": {
    title: "Hand Tracking Demo",
    content: `
      Our hand tracking demo showcases the capabilities of VisionPipe3D.

      The demo tracks 21 hand landmarks in real-time, including:
      - Fingertips (5 points)
      - Finger joints (8 points)
      - Palm points (4 points)
      - Wrist (4 points)

      All tracking happens in-browser with no server required.
    `,
    category: "showcase",
    date: "2024-01-10",
    image: "https://placehold.co/800x400/16213e/ffffff?text=Demo",
  },
  "v1-release": {
    title: "Version 1.0 Released",
    content: `
      We're excited to announce the stable release of VisionPipe3D version 1.0!

      This release includes:
      - Stable API for hand tracking
      - Three.js integration helpers
      - Gesture recognition system
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
