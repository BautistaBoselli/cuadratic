import { Client } from "pg";

export const db = new Client({
  user: "example",
  password: "example",
  host: "localhost",
  database: "postgres",
  port: 5433,
});

db.connect();
