import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const prisma = (ctx: any) => ctx.db as any;

export const documentRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const documents = await prisma(ctx).document.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
      });
      return documents;
    } catch (error: unknown) {
      return [];
    }
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const document = await prisma(ctx).document.findUnique({
          where: {
            id: input,
            userId: ctx.session.user.id,
          },
        });
        return document;
      } catch (error: unknown) {
        return null;
      }
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      content: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Creating document with input:", JSON.stringify(input));
        console.log("User ID:", ctx.session.user.id);
        const title = input.title || "Новый документ";
        const db = prisma(ctx);
        if (!db || !db.document) {
          throw new Error("База данных недоступна");
        }
        const document = await db.document.create({
          data: {
            title,
            content: input.content || "",
            userId: ctx.session.user.id,
            isPinned: false,
          },
        });
        console.log("Document created:", document.id);
        return document;
      } catch (error: unknown) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Не удалось создать документ',
        });
      }
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await prisma(ctx).document.delete({
          where: {
            id: input,
            userId: ctx.session.user.id,
          },
        });
        return { success: true };
      } catch (error: unknown) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Не удалось удалить документ',
        });
      }
    }),

  togglePin: protectedProcedure
    .input(z.object({
      id: z.string(),
      isPinned: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const document = await prisma(ctx).document.findFirst({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        if (!document) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Документ не найден',
          });
        }

        await prisma(ctx).document.update({
          where: {
            id: input.id,
          },
          data: {
            isPinned: !document.isPinned,
          },
        });

        return { success: true };
      } catch (error: unknown) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Не удалось изменить статус закрепления',
        });
      }
    }),

  updateOrder: protectedProcedure
    .input(z.object({
      id: z.string(),
      order: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await prisma(ctx).document.update({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          data: {
            order: input.order,
          },
        });

        return { success: true };
      } catch (error: unknown) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Не удалось обновить порядок',
        });
      }
    }),

  updateTitle: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await prisma(ctx).document.update({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          data: {
            title: input.title,
          },
        });

        return { success: true };
      } catch (error: unknown) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Не удалось обновить заголовок',
        });
      }
    }),

  updateContent: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await prisma(ctx).document.update({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          data: {
            content: input.content,
          },
        });

        return { success: true };
      } catch (error: unknown) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Не удалось обновить содержимое',
        });
      }
    }),
}); 