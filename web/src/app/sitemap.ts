import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://example.com";

  const routes = [
    { path: "", changeFrequency: "daily" as const, priority: 1 },
    { path: "/docs", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/pricing", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/playground", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/cloud", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/station", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/about-us", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
