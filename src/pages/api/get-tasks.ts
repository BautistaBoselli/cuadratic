import { db } from "@/utils/db";
import type { NextApiRequest, NextApiResponse } from "next";

export type Task = {
  id: number;
  title: string;
  created_at: string;
  state: 0 | 1 | 2;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await db.query<Task>("SELECT * FROM tasks");
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo las tareas" });
  }
}
