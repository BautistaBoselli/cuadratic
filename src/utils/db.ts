import { Client } from "pg";

export const db = new Client({
  user: "example",
  password: "example",
  host: "localhost",
  database: "example",
});

db.connect();
