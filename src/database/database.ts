import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('sabornote.db');
  }
  return db;
}

export function initDatabase(): void {
  const database = getDatabase();

  database.execSync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS receitas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      ingredientes TEXT NOT NULL,
      modoPreparo TEXT NOT NULL,
      categoria TEXT NOT NULL DEFAULT '',
      tempoPreparo TEXT NOT NULL DEFAULT '',
      favorita INTEGER NOT NULL DEFAULT 0,
      anotacoes TEXT NOT NULL DEFAULT '',
      imagemUri TEXT NOT NULL DEFAULT '',
      origem TEXT NOT NULL DEFAULT 'manual',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
}
