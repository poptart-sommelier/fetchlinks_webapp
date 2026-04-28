import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";

import {
  getPostCount,
  openConfiguredFetchlinksDatabase,
  openFetchlinksDatabase,
  withFetchlinksDatabase,
  type FetchlinksDatabase,
} from "./db";

type Fixture = {
  dbPath: string;
  cleanup: () => void;
};

describe("openFetchlinksDatabase", () => {
  it("opens the configured SQLite database in read-only mode", () => {
    const fixture = createFixtureDatabase();
    const database = openFetchlinksDatabase({ fetchlinksDbPath: fixture.dbPath });

    try {
      expect(database.isOpen).toBe(true);
      expect(getPostCount(database)).toBe(2);
      expect(() => insertPost(database)).toThrow();
    } finally {
      database.close();
      fixture.cleanup();
    }
  });

  it("fails when a read-only database path does not exist", () => {
    const fixture = createTempPath();

    try {
      expect(() =>
        openFetchlinksDatabase({ fetchlinksDbPath: fixture.dbPath }),
      ).toThrow();
    } finally {
      fixture.cleanup();
    }
  });
});

describe("openConfiguredFetchlinksDatabase", () => {
  it("loads configuration from the provided environment", () => {
    const fixture = createFixtureDatabase();
    const database = openConfiguredFetchlinksDatabase({
      FETCHLINKS_DB: fixture.dbPath,
    });

    try {
      expect(getPostCount(database)).toBe(2);
    } finally {
      database.close();
      fixture.cleanup();
    }
  });
});

describe("withFetchlinksDatabase", () => {
  it("closes the database after running the callback", () => {
    const fixture = createFixtureDatabase();
    let callbackDatabase: FetchlinksDatabase | undefined;

    try {
      const count = withFetchlinksDatabase(
        { fetchlinksDbPath: fixture.dbPath },
        (database) => {
          callbackDatabase = database;
          return getPostCount(database);
        },
      );

      expect(count).toBe(2);
      expect(callbackDatabase?.isOpen).toBe(false);
    } finally {
      fixture.cleanup();
    }
  });
});

function createFixtureDatabase(): Fixture {
  const fixture = createTempPath();
  const database = new DatabaseSync(fixture.dbPath);

  database.exec(`
    CREATE TABLE posts (
      idx INTEGER PRIMARY KEY,
      source TEXT NOT NULL,
      author TEXT,
      description TEXT,
      direct_link TEXT,
      date_created TEXT NOT NULL,
      unique_id_string TEXT NOT NULL
    );

    CREATE TABLE post_urls (
      idx INTEGER PRIMARY KEY,
      post_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      url TEXT NOT NULL,
      url_hash TEXT NOT NULL,
      unshortened_url TEXT,
      FOREIGN KEY (post_id) REFERENCES posts(idx)
    );

    INSERT INTO posts (
      idx,
      source,
      author,
      description,
      direct_link,
      date_created,
      unique_id_string
    ) VALUES
      (1, 'rss', 'Ada', 'First post', 'https://example.com/first', '2026-04-27T10:00:00Z', 'rss-1'),
      (2, 'reddit', 'Grace', 'Second post', 'https://example.com/second', '2026-04-28T10:00:00Z', 'reddit-2');

    INSERT INTO post_urls (
      idx,
      post_id,
      position,
      url,
      url_hash,
      unshortened_url
    ) VALUES
      (1, 1, 0, 'https://short.example/a', 'hash-a', 'https://example.com/a'),
      (2, 2, 0, 'https://example.com/b', 'hash-b', NULL);
  `);

  database.close();

  return fixture;
}

function createTempPath(): Fixture {
  const directory = mkdtempSync(path.join(tmpdir(), "fetchlinks-web-"));

  return {
    dbPath: path.join(directory, "fetchlinks.db"),
    cleanup: () => rmSync(directory, { force: true, recursive: true }),
  };
}

function insertPost(database: FetchlinksDatabase): void {
  database.exec(`
    INSERT INTO posts (
      idx,
      source,
      author,
      description,
      direct_link,
      date_created,
      unique_id_string
    ) VALUES (
      3,
      'rss',
      'Read Only',
      'This should fail',
      'https://example.com/readonly',
      '2026-04-29T10:00:00Z',
      'rss-3'
    );
  `);
}