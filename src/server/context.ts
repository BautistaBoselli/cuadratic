import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getCookie } from "cookies-next";
import jwt from "jsonwebtoken";

export async function createContext(opts: CreateNextContextOptions) {
  const token = getCookie("auth", { req: opts.req, res: opts.res });
  if (!token) {
    return { session: null };
  }

  try {
    const { username } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { username: string };
    // simulating userinfo queing
    const user = { name: username };

    return {
      session: { username, user },
    };
  } catch (error) {
    return { session: null };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;
