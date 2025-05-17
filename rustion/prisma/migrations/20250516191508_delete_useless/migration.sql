/*
  Warnings:

  - You are about to drop the column `firstname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subgroup` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Squad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentsOnTasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Squad" DROP CONSTRAINT "Squad_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Squad" DROP CONSTRAINT "Squad_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "StudentsOnTasks" DROP CONSTRAINT "StudentsOnTasks_squadId_fkey";

-- DropForeignKey
ALTER TABLE "StudentsOnTasks" DROP CONSTRAINT "StudentsOnTasks_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_taskTypeId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_groupId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstname",
DROP COLUMN "groupId",
DROP COLUMN "subgroup",
DROP COLUMN "surname";

-- DropTable
DROP TABLE "Grade";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "Squad";

-- DropTable
DROP TABLE "StudentsOnTasks";

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "TaskType";
