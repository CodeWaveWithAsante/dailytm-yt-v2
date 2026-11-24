"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { boardViewInput, type TaskViewState } from "@/lib/task-view-state";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { TaskSummary, WorkflowStatusRow } from "@/trpc/types";
import {
  AssigneeAvatar,
  DueDate,
  LabelPill,
  PriorityGlyph,
  StatusDot,
  SubtaskCount,
} from "./task-badges";

export function TaskBoard({
  projectId,
  statuses,
  viewState,
  today,
  onOpenTask,
  onCreateIn,
}: {
  projectId: string;
  statuses: WorkflowStatusRow[];
  viewState: TaskViewState;
  today: Date;
  onOpenTask: (taskId: string) => void;
  onCreateIn: (statusId: string) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const options = trpc.task.list.queryOptions(
    boardViewInput(projectId, viewState),
  );
  const { data } = useSuspenseQuery(options);

  // Server order is rank order, so a stable bucket per status keeps it.
  const columns = useMemo(() => {
    const byStatus = new Map<string, TaskSummary[]>(
      statuses.map((status) => [status.id, []]),
    );
    for (const task of data.items) byStatus.get(task.statusId)?.push(task);
    return byStatus;
  }, [data.items, statuses]);

  const move = useMutation(
    trpc.task.move.mutationOptions({
      onError: (error) =>
        toast.error("That move didn't stick", {
          description:
            error.data?.code === "FORBIDDEN"
              ? "Your role does not allow editing tasks."
              : error.message,
        }),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: trpc.task.pathKey() }),
    }),
  );

  function onDragEnd({ destination, source, draggableId }: DropResult) {
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const status = statuses.find((s) => s.id === destination.droppableId);
    if (!status) return;

    const target = (columns.get(status.id) ?? []).filter(
      (task) => task.id !== draggableId,
    );
    const before = target[destination.index - 1] ?? null;
    const after = target[destination.index] ?? null;

    const previous = queryClient.getQueryData(options.queryKey);
    queryClient.setQueryData(options.queryKey, (old) => {
      if (!old) return old;
      const moving = old.items.find((task) => task.id === draggableId);
      if (!moving) return old;
      const rest = old.items.filter((task) => task.id !== draggableId);
      const at = before
        ? rest.findIndex((task) => task.id === before.id) + 1
        : after
          ? rest.findIndex((task) => task.id === after.id)
          : rest.length;
      rest.splice(at, 0, {
        ...moving,
        statusId: status.id,
        status: {
          id: status.id,
          name: status.name,
          color: status.color,
          category: status.category,
        },
      });
      return { ...old, items: rest };
    });

    move.mutate(
      {
        taskId: draggableId,
        statusId: status.id,
        beforeId: before?.id ?? null,
        afterId: after?.id ?? null,
      },
      {
        onError: () => queryClient.setQueryData(options.queryKey, previous),
      },
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto px-4 pb-4 md:px-6">
        {statuses.map((status) => {
          const tasks = columns.get(status.id) ?? [];
          return (
            <section
              key={status.id}
              aria-label={`${status.name}, ${tasks.length} tasks`}
              className="flex w-72 shrink-0 flex-col"
            >
              <header className="group/col flex h-10 items-center gap-2 px-1.5">
                <StatusDot status={status} />
                <h2 className="text-sm font-medium">{status.name}</h2>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {tasks.length}
                </span>
                <button
                  type="button"
                  onClick={() => onCreateIn(status.id)}
                  aria-label={`Add task to ${status.name}`}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring ml-auto grid size-7 place-items-center rounded-md opacity-60 transition-[opacity,background-color] duration-(--duration-fast) group-hover/col:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <PlusIcon className="size-4" aria-hidden />
                </button>
              </header>

              <Droppable droppableId={status.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto rounded-xl p-1.5 transition-colors duration-(--duration-normal)",
                      snapshot.isDraggingOver
                        ? "bg-accent/60 ring-primary/30 ring-1"
                        : "bg-muted/40",
                    )}
                  >
                    {tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(drag, dragSnapshot) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            {...drag.dragHandleProps}
                            role="button"
                            aria-label={`Open ${task.title}`}
                            onClick={() => onOpenTask(task.id)}
                            onKeyDown={(event) => {
                              // Space lifts the card (the library's binding);
                              // Enter opens it.
                              if (event.key === "Enter") onOpenTask(task.id);
                            }}
                            className="focus-visible:ring-ring rounded-lg outline-none focus-visible:ring-2"
                          >
                            <TaskCard
                              task={task}
                              today={today}
                              dragging={dragSnapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {tasks.length === 0 && !snapshot.isDraggingOver ? (
                      <button
                        type="button"
                        onClick={() => onCreateIn(status.id)}
                        className="text-muted-foreground hover:text-foreground hover:border-foreground/20 focus-visible:ring-ring flex h-20 items-center justify-center gap-1.5 rounded-lg border border-dashed text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <PlusIcon className="size-3.5" aria-hidden />
                        Add a task
                      </button>
                    ) : null}
                  </div>
                )}
              </Droppable>
            </section>
          );
        })}
      </div>
    </DragDropContext>
  );
}

function TaskCard({
  task,
  today,
  dragging,
}: {
  task: TaskSummary;
  today: Date;
  dragging: boolean;
}) {
  const done = task.status.category === "DONE";
  return (
    <article
      className={cn(
        "bg-card hover:border-foreground/15 cursor-grab rounded-lg border p-3 shadow-xs transition-[border-color,box-shadow,transform] duration-(--duration-fast)",
        dragging &&
          "ring-primary/40 rotate-[1.5deg] cursor-grabbing shadow-lg ring-1",
      )}
    >
      <div className="flex items-start gap-2">
        <h3
          className={cn(
            "min-w-0 flex-1 text-sm leading-snug font-medium",
            done && "text-muted-foreground line-through decoration-1",
          )}
        >
          {task.title}
        </h3>
        {task.assignee ? (
          <AssigneeAvatar
            name={task.assignee.name}
            image={task.assignee.image}
            className="size-5"
          />
        ) : null}
      </div>

      {task.descriptionText ? (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
          {task.descriptionText}
        </p>
      ) : null}

      {task.labels.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((label) => (
            <LabelPill key={label.id} label={label} />
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-3">
        <PriorityGlyph priority={task.priority} />
        {task.dueDate ? <DueDate date={task.dueDate} today={today} /> : null}
        <SubtaskCount
          done={task.subtaskCount.done}
          total={task.subtaskCount.total}
          className="ml-auto"
        />
      </div>
    </article>
  );
}

export function TaskBoardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading board"
      className="flex flex-1 gap-3 overflow-hidden px-4 pb-4 md:px-6"
    >
      {Array.from({ length: 4 }, (_, column) => (
        <div key={column} className="w-72 shrink-0 space-y-2">
          <Skeleton className="h-6 w-28" />
          <div className="bg-muted/40 space-y-2 rounded-xl p-1.5">
            {Array.from({ length: 3 - (column % 2) }, (_, card) => (
              <Skeleton key={card} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
