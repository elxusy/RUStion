import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

// Приведение типа, чтобы обойти проблему с типизацией Prisma
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
    } catch (error) {
      console.error("Ошибка при получении документов:", error);
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
      } catch (error) {
        console.error("Ошибка при получении документа:", error);
        throw error;
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

        // Проверка входных данных и установка значений по умолчанию
        const title = input.title || "Новый документ";
        
        // Проверим, доступна ли база данных
        const db = prisma(ctx);
        if (!db || !db.document) {
          throw new Error("База данных недоступна");
        }
        
        // Создаем документ только с полями, которые есть в схеме
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
      } catch (error: any) {
        console.error("Ошибка при создании документа:", error);
        console.error("Сообщение:", error.message);
        console.error("Стек:", error.stack);
        // Возвращаем более информативную ошибку
        throw new Error(`Ошибка при создании документа: ${error.message}`);
      }
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        return await prisma(ctx).document.delete({
          where: {
            id: input,
            userId: ctx.session.user.id,
          },
        });
      } catch (error) {
        console.error("Ошибка при удалении документа:", error);
        throw error;
      }
    }),

  togglePin: protectedProcedure
    .input(z.object({
      id: z.string(),
      isPinned: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await prisma(ctx).document.update({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          data: {
            isPinned: input.isPinned,
          },
        });
      } catch (error) {
        console.error("Ошибка при изменении закрепления:", error);
        throw error;
      }
    }),

  updateOrder: protectedProcedure
    .input(z.object({
      id: z.string(),
      order: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await prisma(ctx).document.update({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          data: {
            order: input.order,
          },
        });
      } catch (error) {
        console.error("Ошибка при обновлении порядка:", error);
        throw error;
      }
    }),

  updateTitle: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await prisma(ctx).document.update({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          data: {
            title: input.title,
          },
        });
      } catch (error) {
        console.error("Ошибка при обновлении заголовка:", error);
        throw error;
      }
    }),

  updateContent: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await prisma(ctx).document.update({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          data: {
            content: input.content,
          },
        });
      } catch (error) {
        console.error("Ошибка при обновлении содержимого:", error);
        throw error;
      }
    }),
}); 