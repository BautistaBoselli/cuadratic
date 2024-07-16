import { db } from "@/utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { Task } from "../../types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //   console.log(req.body);
  //get hour and minute
  let time = new Date().toTimeString().slice(0, 5);
  //   console.log(time);
  try {
    await db.query<Task>("BEGIN");
    const queryText =
      "INSERT INTO tasks (title, created_at) VALUES ($1, $2) RETURNING *";
    await db.query<Task>(queryText, [req.body.title, time]);
    await db.query<Task>("COMMIT");
    res.status(200).json({ message: "Tarea creada" });
  } catch (error) {
    console.error(error);
    await db.query<Task>("ROLLBACK");
    res.status(500).json({ message: "Error creando la tarea" });
  }
}
