import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const documentRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.document.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { updatedAt: 'desc' },
      });
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.document.findUnique({
        where: { id: input },
      });
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.document.create({
        data: {
          title: input.title,
          content: '',
          userId: ctx.session.user.id,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.document.delete({
        where: { id: input },
      });
    }),

  togglePin: protectedProcedure
    .input(z.object({
      id: z.string(),
      isPinned: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.document.update({
        where: { id: input.id },
        data: { isPinned: input.isPinned },
      });
    }),

  updateOrder: protectedProcedure
    .input(z.object({
      id: z.string(),
      order: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.document.update({
        where: { id: input.id },
        data: { order: input.order },
      });
    }),

  updateTitle: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.document.findUnique({
        where: { id: input.id },
      });

      if (!document) {
        return ctx.db.document.create({
          data: {
            id: input.id,
            title: input.title,
            content: '',
            userId: ctx.session.user.id,
          },
        });
      }

      return ctx.db.document.update({
        where: { id: input.id },
        data: { title: input.title },
      });
    }),

  updateContent: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.document.findUnique({
        where: { id: input.id },
      });

      if (!document) {
        return ctx.db.document.create({
          data: {
            id: input.id,
            title: 'Новый документ',
            content: input.content,
            userId: ctx.session.user.id,
          },
        });
      }

      return ctx.db.document.update({
        where: { id: input.id },
        data: { content: input.content },
      });
    }),
}); 