import type { PostPage, PostSummary, PostUrl } from "../models/read-models";
import { getPosts, openConfiguredFetchlinksDatabase } from "../server/db";

type PageSearchParams = Record<string, string | string[] | undefined>;

type HomeProps = {
  searchParams?: Promise<PageSearchParams>;
};

type Env = Partial<Record<string, string | undefined>>;

type LatestPostsResult =
  | {
      status: "ready";
      page: PostPage;
    }
  | {
      status: "error";
    };

const POSTS_PER_PAGE = 50;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomeProps = {}) {
  const resolvedSearchParams = await searchParams;
  const page = getPageFromSearchParams(resolvedSearchParams);

  return <LatestPostsView result={loadLatestPosts({ page })} />;
}

export function loadLatestPosts({
  env = process.env,
  page = 1,
}: {
  env?: Env;
  page?: number;
} = {}): LatestPostsResult {
  try {
    const database = openConfiguredFetchlinksDatabase(env);

    try {
      return {
        status: "ready",
        page: getPosts(database, { page, pageSize: POSTS_PER_PAGE }),
      };
    } finally {
      if (database.isOpen) {
        database.close();
      }
    }
  } catch {
    return { status: "error" };
  }
}

export function LatestPostsView({ result }: { result: LatestPostsResult }) {
  if (result.status === "error") {
    return (
      <main className="shell">
        <PageHeader />
        <section className="state state-error" role="alert">
          <h2>Posts are unavailable</h2>
          <p>The database could not be opened. Check the server configuration.</p>
        </section>
      </main>
    );
  }

  const { page } = result;

  return (
    <main className="shell">
      <PageHeader page={page} />
      {page.posts.length === 0 ? <EmptyPostsState page={page} /> : null}
      {page.posts.length > 0 ? (
        <section className="post-list" aria-label="Latest posts">
          {page.posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </section>
      ) : null}
      <Pagination page={page} />
    </main>
  );
}

function PageHeader({ page }: { page?: PostPage }) {
  return (
    <header className="page-header">
      <p className="eyebrow">Fetchlinks</p>
      <div>
        <h1>Latest posts</h1>
        {page ? (
          <p className="page-summary">
            {page.totalPosts.toLocaleString("en-US")} posts collected
          </p>
        ) : null}
      </div>
    </header>
  );
}

function EmptyPostsState({ page }: { page: PostPage }) {
  const message =
    page.totalPosts === 0
      ? "No posts have been collected yet."
      : "No posts were found on this page.";

  return (
    <section className="state">
      <h2>No posts</h2>
      <p>{message}</p>
    </section>
  );
}

function PostListItem({ post }: { post: PostSummary }) {
  return (
    <article className="post-item">
      <div className="post-meta">
        <span>{post.source}</span>
        {post.author ? <span>{post.author}</span> : null}
        <time dateTime={post.dateCreated}>{formatPostDate(post.dateCreated)}</time>
      </div>
      <h2>{post.description ?? "Untitled post"}</h2>
      <div className="post-actions">
        {post.directLink ? (
          <a href={post.directLink} rel="noreferrer" target="_blank">
            Source post
          </a>
        ) : null}
      </div>
      {post.urls.length > 0 ? (
        <ul className="url-list">
          {post.urls.map((url) => (
            <PostUrlItem key={url.id} url={url} />
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function PostUrlItem({ url }: { url: PostUrl }) {
  const usesUnshortenedUrl = url.href !== url.originalUrl;

  return (
    <li>
      <a href={url.href} rel="noreferrer" target="_blank">
        {formatUrlLabel(url.href)}
      </a>
      {usesUnshortenedUrl ? (
        <span className="url-original">via {formatUrlLabel(url.originalUrl)}</span>
      ) : null}
    </li>
  );
}

function Pagination({ page }: { page: PostPage }) {
  const totalPages = Math.max(page.totalPages, 1);

  return (
    <nav className="pagination" aria-label="Posts pagination">
      {page.hasPreviousPage ? (
        <a href={buildPageHref(page.page - 1)}>Previous</a>
      ) : (
        <span aria-disabled="true">Previous</span>
      )}
      <span>
        Page {page.page.toLocaleString("en-US")} of {totalPages.toLocaleString("en-US")}
      </span>
      {page.hasNextPage ? (
        <a href={buildPageHref(page.page + 1)}>Next</a>
      ) : (
        <span aria-disabled="true">Next</span>
      )}
    </nav>
  );
}

function getPageFromSearchParams(searchParams: PageSearchParams | undefined) {
  const value = searchParams?.page;
  const page = Array.isArray(value) ? value[0] : value;

  if (!page) {
    return 1;
  }

  const parsedPage = Number(page);

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function buildPageHref(page: number) {
  return page === 1 ? "/" : `/?page=${page}`;
}

function formatPostDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.valueOf()) ? value : dateFormatter.format(date);
}

function formatUrlLabel(value: string) {
  try {
    const url = new URL(value);

    return `${url.hostname}${url.pathname}${url.search}`;
  } catch {
    return value;
  }
}
