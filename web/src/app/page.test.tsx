import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { PostPage } from "../models/read-models";
import { LatestPostsView, loadLatestPosts } from "./page";

describe("Home", () => {
  it("renders posts with metadata, extracted URLs, and pagination links", () => {
    const markup = renderToStaticMarkup(
      <LatestPostsView result={{ status: "ready", page: createPostPage() }} />,
    );

    expect(markup).toContain("Latest posts");
    expect(markup).toContain("Newest post");
    expect(markup).toContain("reddit");
    expect(markup).toContain("Grace");
    expect(markup).toContain("Apr 28, 2026, 10:00 AM");
    expect(markup).toContain("Source post");
    expect(markup).toContain("example.com/unshortened-b");
    expect(markup).toContain("via short.example/b");
    expect(markup).toContain('href="/?page=2"');
  });

  it("renders an empty state when no posts exist", () => {
    const markup = renderToStaticMarkup(
      <LatestPostsView
        result={{
          status: "ready",
          page: createPostPage({ posts: [], totalPosts: 0, totalPages: 0 }),
        }}
      />,
    );

    expect(markup).toContain("No posts");
    expect(markup).toContain("No posts have been collected yet.");
    expect(markup).toContain("Page 1 of 1");
  });

  it("renders a safe error state when the database cannot be configured", () => {
    const result = loadLatestPosts({ env: {} });
    const markup = renderToStaticMarkup(<LatestPostsView result={result} />);

    expect(result.status).toBe("error");
    expect(markup).toContain("Posts are unavailable");
    expect(markup).toContain("The database could not be opened.");
    expect(markup).not.toContain("FETCHLINKS_DB is required");
  });
});

function createPostPage(overrides: Partial<PostPage> = {}): PostPage {
  return {
    posts: [
      {
        id: 2,
        source: "reddit",
        author: "Grace",
        description: "Newest post",
        directLink: "https://example.com/source-post",
        dateCreated: "2026-04-28T10:00:00Z",
        uniqueId: "reddit-2",
        urls: [
          {
            id: 3,
            postId: 2,
            position: 0,
            originalUrl: "https://example.com/direct-b",
            urlHash: "hash-b0",
            unshortenedUrl: null,
            href: "https://example.com/direct-b",
          },
          {
            id: 2,
            postId: 2,
            position: 1,
            originalUrl: "https://short.example/b",
            urlHash: "hash-b1",
            unshortenedUrl: "https://example.com/unshortened-b",
            href: "https://example.com/unshortened-b",
          },
        ],
      },
    ],
    page: 1,
    pageSize: 50,
    totalPosts: 51,
    totalPages: 2,
    hasPreviousPage: false,
    hasNextPage: true,
    ...overrides,
  };
}