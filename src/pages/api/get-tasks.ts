import { db } from "@/utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { Task } from "../../types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.query);
  const { user } = req.query;

  if (!user || user.length > 32) {
    return res.status(400).json({ message: "Failure loggin in" });
  }

  try {
    const queryText = "SELECT * FROM tasks WHERE username = $1 ORDER BY id ASC";
    const response = await db.query<Task>(queryText, [user]);
    console.log(response.rows);
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo las tareas" });
  }
}
