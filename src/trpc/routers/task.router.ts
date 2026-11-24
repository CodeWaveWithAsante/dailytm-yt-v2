import {
  createTaskInput,
  listTasksInput,
  moveTaskInput,
  updateTaskInput,
} from "@/lib/validations/project";
import {
  createTRPCRouter,
  orgProcedure,
  permittedProcedure,
  permittedTaskProcedure,
  taskProcedure,
} from "../init";
import * as taskService from "@/server/services/task.service";

export const taskRouter = createTRPCRouter({
  list: orgProcedure
    .input(listTasksInput)
    .query(({ ctx, input }) => taskService.list(ctx, input)),

  byId: taskProcedure.query(({ ctx }) =>
    taskService.byId(ctx, { taskId: ctx.task.id }),
  ),

  create: permittedProcedure({ task: ["create"] })
    .input(createTaskInput)
    .mutation(({ ctx, input }) => taskService.create(ctx, input)),

  update: permittedTaskProcedure({ task: ["update"] })
    .input(updateTaskInput)
    .mutation(({ ctx, input }) =>
      taskService.update(ctx, { ...input, taskId: ctx.task.id }),
    ),

  move: permittedTaskProcedure({ task: ["update"] })
    .input(moveTaskInput)
    .mutation(({ ctx, input }) =>
      taskService.move(ctx, { ...input, taskId: ctx.task.id }),
    ),

  delete: permittedTaskProcedure({ task: ["delete"] }).mutation(({ ctx }) =>
    taskService.remove(ctx, { taskId: ctx.task.id }),
  ),
});
