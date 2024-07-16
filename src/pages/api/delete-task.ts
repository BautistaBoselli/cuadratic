import { db } from "@/utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { Task } from "../../types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  if (!req.body.id) {
    return res.status(400).json({ message: "Missing task id" });
  }

  try {
    await db.query<Task>("BEGIN");
    const queryText = "DELETE FROM tasks WHERE id = $1";
    await db.query<Task>(queryText, [req.body.id]);
    await db.query<Task>("COMMIT");
    res.status(200).json({ message: "Tarea eliminada" });
  } catch (error) {
    console.error(error);
    await db.query<Task>("ROLLBACK");
    res.status(500).json({ message: "Error eliminando la tarea" });
  }
}
