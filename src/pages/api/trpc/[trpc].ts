/**
 * This is the API-handler of your app that contains all your API routes.
 * On a bigger app, you will probably want to split this file up into multiple files.
 */
import * as trpcNext from "@trpc/server/adapters/next";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "../../../server/trpc";
import { z } from "zod";
import { sleep } from "@/utils/sleep";
import { db } from "@/utils/db";
import { Task } from "@/types";
import { TRPCError } from "@trpc/server";
import { de } from "date-fns/locale";
import { create } from "domain";
import { createContext } from "@/server/context";

const appRouter = router({
  getTasks: protectedProcedure
    .input(
      z.object({
        delay: z.number({ message: "missing delay" }),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        await sleep(input.delay);
        const queryText =
          "SELECT * FROM tasks WHERE username = $1 ORDER BY id ASC";
        const response = await db.query<Task>(queryText, [
          ctx.session.username,
        ]);
        return response.rows;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          message: "Error obteniendo las tareas",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  addTask: protectedProcedure
    .input(
      z.object({
        title: z.string({ message: "missing task" }),
        delay: z.number({ message: "missing delay" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(ctx.session.username);
      try {
        await sleep(input.delay);
        const queryText =
          "INSERT INTO tasks(username, title, created_at) VALUES($1, $2, $3) RETURNING *";
        await db.query<Task>(queryText, [
          ctx.session.username,
          input.title,
          new Date(),
        ]);
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          message: "Error agregando la tarea",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
});
