import { DatabaseSync } from "node:sqlite";

import { loadAppConfig, type AppConfig } from "./config";

type DbConfig = Pick<AppConfig, "fetchlinksDbPath">;

type Env = Partial<Record<string, string | undefined>>;

type CountRow = {
  count: number;
};

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