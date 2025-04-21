import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const documentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ 
      title: z.string().min(1),
      parentId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.document.create({
        data: {
          title: input.title,
          userId: ctx.session.user.id,
          parentId: input.parentId,
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.document.findMany({
      where: {
        userId: ctx.session.user.id,
        isArchived: false,
        parentId: null,
      },
      include: {
        children: {
          where: {
            isArchived: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.document.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          children: {
            where: {
              isArchived: false,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      content: z.string().optional(),
      isArchived: z.boolean().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.document.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.document.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
}); 