import { type MySql2Database, drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";

let _db: MySql2Database<typeof schema> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: "default" });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
