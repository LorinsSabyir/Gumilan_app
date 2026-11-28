import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

let databasePromise: Promise<SQLiteDatabase> | null = null;

export function getLocalDatabase(): Promise<SQLiteDatabase> {
  if (databasePromise === null) {
    databasePromise = SQLite.openDatabaseAsync('gumilan.db').then(async (database) => {
      await database.execAsync('PRAGMA foreign_keys = ON;');
      return database;
    });
  }

  return databasePromise;
}
