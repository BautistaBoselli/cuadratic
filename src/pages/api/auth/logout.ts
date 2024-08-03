import { deleteCookie, getCookie } from "cookies-next";
import { createHash } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  deleteCookie("auth", { req, res });
  return res.status(200).json({ success: true });
}
