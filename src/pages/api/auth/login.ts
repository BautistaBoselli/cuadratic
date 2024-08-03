import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { createHash } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username } = req.body;
  const token = jwt.sign({ username }, process.env.JWT_SECRET as string);
  const cookie = getCookie("auth", { req, res });
  console.log({ cookie });

  setCookie("auth", token, { req, res, httpOnly: true });

  return res.status(200).json({ success: true });
}
