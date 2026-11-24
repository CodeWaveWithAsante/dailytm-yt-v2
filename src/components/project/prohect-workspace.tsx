"use client";

import { startOfTodayUtc } from "@/lib/task.queries";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Suspense, useCallback, useState } from "react";
import { KanbanIcon, ListIcon, PlusIcon } from "lucide-react";

import { useTaskViewState } from "@/hooks/use-task-view";
import { Button } from "../ui/button";
import { ViewToggle } from "./project-view";
import { TaskBoard, TaskBoardSkeleton } from "./task/task-board";
import { CreateTaskDialog } from "./task/task-form";
import { TaskList, TaskListSkeleton } from "./task/task-list";
import { TaskSheet } from "./task/task-sheet";

const VIEW_OPTIONS = [
  { value: "board", label: "Board", Icon: KanbanIcon },
  { value: "list", label: "List", Icon: ListIcon },
] as const;

export const ProjectWorkspace = ({ projectId }: { projectId: string }) => {
  const trpc = useTRPC();
  const [viewState, setViewState] = useTaskViewState();

  const statusQuery = useQuery(trpc.workflow.list.queryOptions({ projectId }));
  const statuses = statusQuery.data ?? [];

  const [creating, setCreating] = useState<string | null>(null);
  const today = startOfTodayUtc();
  // ponytail: calendar is in the URL schema but not built; it renders as list.
  const view = viewState.view === "board" ? "board" : "list";

  const openTask = useCallback(
    (taskId: string) => void setViewState({ task: taskId }),
    [setViewState],
  );
  const closeTask = () => void setViewState({ task: null });

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-6">
        <ViewToggle
          label="Task layout"
          value={view}
          options={VIEW_OPTIONS}
          onChange={(next) => void setViewState({ view: next })}
        />
        <span className="flex-1" />
        <Button
          className="h-9"
          disabled={statuses.length === 0}
          onClick={() => setCreating(statuses[0]?.id ?? null)}
        >
          <PlusIcon className="size-4" aria-hidden />
          New task
        </Button>
      </div>

      <div
        key={view}
        className="animate-in fade-in-0 flex min-h-0 flex-1 flex-col duration-300"
      >
        {view === "board" ? (
          statusQuery.isPending ? (
            <TaskBoardSkeleton />
          ) : (
            <Suspense fallback={<TaskBoardSkeleton />}>
              <TaskBoard
                projectId={projectId}
                statuses={statuses}
                viewState={viewState}
                today={today}
                onOpenTask={openTask}
                onCreateIn={setCreating}
              />
            </Suspense>
          )
        ) : (
          <Suspense fallback={<TaskListSkeleton />}>
            <TaskList
              projectId={projectId}
              viewState={viewState}
              today={today}
              onOpenTask={openTask}
            />
          </Suspense>
        )}
      </div>

      <TaskSheet
        taskId={viewState.task}
        statuses={statuses}
        onOpenTask={openTask}
        onClose={closeTask}
      />

      {creating !== null ? (
        <CreateTaskDialog
          key={creating}
          projectId={projectId}
          statuses={statuses}
          open
          onOpenChange={(open) => setCreating(open ? creating : null)}
          defaultStatusId={creating}
        />
      ) : null}
    </>
  );
};
