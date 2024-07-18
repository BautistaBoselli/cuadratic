import { db } from "@/utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { Task } from "../../types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await db.query<Task>(
      "SELECT * FROM tasks ORDER BY id ASC"
    );
    console.log(response.rows);
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo las tareas" });
  }
}
