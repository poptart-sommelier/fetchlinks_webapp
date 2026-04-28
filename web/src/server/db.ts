import { DatabaseSync } from "node:sqlite";

import type { PostPage, PostUrl } from "../models/read-models";
import { loadAppConfig, type AppConfig } from "./config";

type DbConfig = Pick<AppConfig, "fetchlinksDbPath">;

type Env = Partial<Record<string, string | undefined>>;

type CountRow = {
  count: number;
};

type PostRow = {
  id: number;
  source: string;
  author: string | null;
  description: string | null;
  directLink: string | null;
  dateCreated: string;
  uniqueId: string;
};

type PostUrlRow = {
  id: number;
  postId: number;
  position: number;
  originalUrl: string;
  urlHash: string;
  unshortenedUrl: string | null;
};

export type GetPostsOptions = {
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;

export type FetchlinksDatabase = DatabaseSync;

export function openFetchlinksDatabase(config: DbConfig): FetchlinksDatabase {
  return new DatabaseSync(config.fetchlinksDbPath, {
    readOnly: true,
    timeout: 5000,
  });
}

export function openConfiguredFetchlinksDatabase(
  env: Env = process.env,
): FetchlinksDatabase {
  return openFetchlinksDatabase(loadAppConfig(env));
}

export function withFetchlinksDatabase<T>(
  config: DbConfig,
  callback: (database: FetchlinksDatabase) => T,
): T {
  const database = openFetchlinksDatabase(config);

  try {
    return callback(database);
  } finally {
    if (database.isOpen) {
      database.close();
    }
  }
}

export function getPostCount(database: FetchlinksDatabase): number {
  const row = database.prepare("SELECT COUNT(*) AS count FROM posts").get() as
    | CountRow
    | undefined;

  return row?.count ?? 0;
}

export function getPosts(
  database: FetchlinksDatabase,
  options: GetPostsOptions = {},
): PostPage {
  const page = normalizePositiveInteger(options.page, DEFAULT_PAGE, "page");
  const pageSize = normalizePositiveInteger(
    options.pageSize,
    DEFAULT_PAGE_SIZE,
    "pageSize",
  );
  const totalPosts = getPostCount(database);
  const totalPages = Math.ceil(totalPosts / pageSize);
  const postRows = database
    .prepare(`
      SELECT
        idx AS id,
        source,
        author,
        description,
        direct_link AS directLink,
        date_created AS dateCreated,
        unique_id_string AS uniqueId
      FROM posts
      ORDER BY date_created DESC, idx DESC
      LIMIT ? OFFSET ?
    `)
    .all(pageSize, (page - 1) * pageSize) as PostRow[];
  const urlsByPostId = getUrlsByPostId(
    database,
    postRows.map((post) => post.id),
  );

  return {
    posts: postRows.map((post) => ({
      ...post,
      urls: urlsByPostId.get(post.id) ?? [],
    })),
    page,
    pageSize,
    totalPosts,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

function getUrlsByPostId(
  database: FetchlinksDatabase,
  postIds: number[],
): Map<number, PostUrl[]> {
  if (postIds.length === 0) {
    return new Map();
  }

  const placeholders = postIds.map(() => "?").join(", ");
  const urlRows = database
    .prepare(`
      SELECT
        idx AS id,
        post_id AS postId,
        position,
        url AS originalUrl,
        url_hash AS urlHash,
        unshortened_url AS unshortenedUrl
      FROM post_urls
      WHERE post_id IN (${placeholders})
      ORDER BY post_id ASC, position ASC, idx ASC
    `)
    .all(...postIds) as PostUrlRow[];
  const urlsByPostId = new Map<number, PostUrl[]>();

  for (const url of urlRows) {
    const postUrls = urlsByPostId.get(url.postId) ?? [];

    postUrls.push({
      ...url,
      href: url.unshortenedUrl ?? url.originalUrl,
    });
    urlsByPostId.set(url.postId, postUrls);
  }

  return urlsByPostId;
}

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number,
  name: string,
): number {
  if (value === undefined) {
    return fallback;
  }

  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive integer.`);
  }

  return value;
}