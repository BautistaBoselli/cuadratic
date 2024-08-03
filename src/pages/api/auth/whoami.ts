import { deleteCookie, getCookie } from "cookies-next";
import { createHash } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getCookie("auth", { req, res });
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { username } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { username: string };
    // simulating userinfo queing
    const user = { name: username };

    return res.status(200).json({ username, user });
  } catch (error) {
    deleteCookie("auth", { res });
    return res.status(401).json({ message: "Unauthorized" });
  }
}
