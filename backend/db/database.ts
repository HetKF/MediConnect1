import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const databaseDirectory = path.join(
  process.cwd(),
  'backend',
  'data'
);

const databasePath = path.join(
  databaseDirectory,
  'mediconnect.db'
);

if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, {
    recursive: true,
  });
}

export const db = new Database(databasePath);

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export function initializeDatabase(): void {
  const schemaPath = path.join(
    process.cwd(),
    'backend',
    'db',
    'schema.sql'
  );

  if (!fs.existsSync(schemaPath)) {
    throw new Error(
      `Database schema not found: ${schemaPath}`
    );
  }

  const schema = fs.readFileSync(
    schemaPath,
    'utf-8'
  );

  db.exec(schema);

  console.log(
    `SQLite database initialized: ${databasePath}`
  );
}