"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClockIcon,
  CircleCheckIcon,
  FlagIcon,
  ListChecksIcon,
  Trash2Icon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AssigneeSelect } from "@/components/organization/assignee-select";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { TaskPriority } from "@/generated/prisma/enums";
import { formatDateTime } from "@/lib/format";
import { TASK_PRIORITIES, TASK_PRIORITY_META } from "@/lib/task-view-state";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { TaskSummary, WorkflowStatusRow } from "@/trpc/types";
import { ProjectGlyph } from "../project-client";
import { DateField } from "./date-field";
import { LabelPill, PriorityGlyph, StatusDot } from "./task-badges";

type Patch = {
  title?: string;
  description?: string | null;
  statusId?: string;
  priority?: TaskPriority;
  assigneeId?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
};

export function TaskSheet({
  taskId,
  statuses,
  onOpenTask,
  onClose,
}: {
  taskId: string | null;
  statuses: WorkflowStatusRow[];
  onOpenTask: (taskId: string) => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={taskId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        {taskId ? (
          <TaskSheetBody
            key={taskId}
            taskId={taskId}
            statuses={statuses}
            onOpenTask={onOpenTask}
            onClose={onClose}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function TaskSheetBody({
  taskId,
  statuses,
  onOpenTask,
  onClose,
}: {
  taskId: string;
  statuses: WorkflowStatusRow[];
  onOpenTask: (taskId: string) => void;
  onClose: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const byIdOptions = trpc.task.byId.queryOptions({ taskId });
  const query = useQuery(byIdOptions);
  const task = query.data;

  const update = useMutation(
    trpc.task.update.mutationOptions({
      onMutate: async (patch) => {
        await queryClient.cancelQueries({ queryKey: byIdOptions.queryKey });
        const previous = queryClient.getQueryData(byIdOptions.queryKey);
        if (previous) {
          const status = patch.statusId
            ? statuses.find((s) => s.id === patch.statusId)
            : undefined;
          queryClient.setQueryData(byIdOptions.queryKey, {
            ...previous,
            ...stripUndefined(patch),
            ...(status
              ? {
                  status: {
                    id: status.id,
                    name: status.name,
                    color: status.color,
                    category: status.category,
                  },
                }
              : {}),
          } as TaskSummary);
        }
        return { previous };
      },
      onError: (error, _patch, context) => {
        if (context?.previous) {
          queryClient.setQueryData(byIdOptions.queryKey, context.previous);
        }
        toast.error("Couldn't save that change", {
          description:
            error.data?.code === "FORBIDDEN"
              ? "Your role does not allow editing tasks."
              : error.message,
        });
      },
      onSuccess: (saved) =>
        queryClient.setQueryData(byIdOptions.queryKey, saved),
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.task.list.pathKey(),
        }),
    }),
  );

  const remove = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Task deleted");
        onClose();
        void queryClient.invalidateQueries({ queryKey: trpc.task.pathKey() });
      },
      onError: (error) =>
        toast.error("Couldn't delete this task", {
          description:
            error.data?.code === "FORBIDDEN"
              ? "Your role does not allow deleting tasks."
              : error.message,
        }),
    }),
  );

  const save = (patch: Patch) => update.mutate({ taskId, ...patch });

  if (query.isPending) return <SheetSkeleton />;

  if (!task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <SheetTitle>Task not found</SheetTitle>
        <SheetDescription>
          It may have been deleted, or you no longer have access to it.
        </SheetDescription>
        <Button variant="outline" className="mt-4" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="border-b px-6 pt-5 pb-4">
        <div className="text-muted-foreground mb-3 flex items-center gap-2 pr-10 text-xs">
          <ProjectGlyph
            color={task.project.color}
            icon={task.project.icon}
            size="sm"
          />
          <span className="truncate">{task.project.name}</span>
          {update.isPending ? (
            <span className="ml-auto inline-flex items-center gap-1.5">
              <Spinner className="size-3" /> Saving…
            </span>
          ) : null}
        </div>
        <SheetTitle className="sr-only">{task.title}</SheetTitle>
        <TitleField value={task.title} onSave={(title) => save({ title })} />
        <SheetDescription className="sr-only">
          Task details. Changes save automatically.
        </SheetDescription>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Properties */}
        <dl className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 px-6 py-5 text-sm">
          <Property
            Icon={CircleCheckIcon}
            label="Status"
            htmlFor="sheet-status"
          />
          <dd>
            <Select
              value={task.statusId}
              onValueChange={(statusId) => save({ statusId })}
            >
              <SelectTrigger id="sheet-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    <span className="flex items-center gap-2">
                      <StatusDot status={status} />
                      {status.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>

          <Property Icon={FlagIcon} label="Priority" htmlFor="sheet-priority" />
          <dd>
            <Select
              value={task.priority}
              onValueChange={(priority) =>
                save({ priority: priority as TaskPriority })
              }
            >
              <SelectTrigger id="sheet-priority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    <span className="flex items-center gap-2">
                      <PriorityGlyph priority={priority} />
                      {TASK_PRIORITY_META[priority].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>

          <Property Icon={UserIcon} label="Assignee" htmlFor="sheet-assignee" />
          <dd>
            <AssigneeSelect
              id="sheet-assignee"
              value={task.assignee?.memberId ?? null}
              onChange={(assigneeId) => save({ assigneeId })}
            />
          </dd>

          <Property
            Icon={CalendarClockIcon}
            label="Start date"
            htmlFor="sheet-start"
          />
          <dd>
            <DateField
              id="sheet-start"
              label="Start date"
              value={task.startDate}
              onChange={(startDate) => save({ startDate })}
            />
          </dd>

          <Property
            Icon={CalendarClockIcon}
            label="Due date"
            htmlFor="sheet-due"
          />
          <dd>
            <DateField
              id="sheet-due"
              label="Due date"
              value={task.dueDate}
              onChange={(dueDate) => save({ dueDate })}
            />
          </dd>

          {task.labels.length > 0 ? (
            <>
              <dt className="text-muted-foreground text-sm">Labels</dt>
              <dd className="flex flex-wrap gap-1">
                {task.labels.map((label) => (
                  <LabelPill key={label.id} label={label} />
                ))}
              </dd>
            </>
          ) : null}
        </dl>

        {/* Description */}
        <section className="border-t px-6 py-5">
          <h3 className="mb-2 text-sm font-medium">
            <label htmlFor="sheet-description">Description</label>
          </h3>
          <DescriptionField
            value={task.descriptionText ?? ""}
            onSave={(description) => save({ description })}
          />
        </section>

        {task.parentId === null ? (
          <Subtasks task={task} onOpenTask={onOpenTask} />
        ) : null}

        {/* Meta */}
        <section className="text-muted-foreground space-y-1 border-t px-6 py-5 text-xs">
          <p>Created {formatDateTime(task.createdAt)}</p>
          <p>Updated {formatDateTime(task.updatedAt)}</p>
          {task.completedAt ? (
            <p className="text-success">
              Completed {formatDateTime(task.completedAt)}
            </p>
          ) : null}
        </section>
      </div>

      <div className="flex items-center justify-between border-t px-6 py-3">
        <DeleteButton
          pending={remove.isPending}
          onConfirm={() => remove.mutate({ taskId })}
        />
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

function Property({
  Icon,
  label,
  htmlFor,
}: {
  Icon: LucideIcon;
  label: string;
  htmlFor: string;
}) {
  return (
    <dt>
      <label
        htmlFor={htmlFor}
        className="text-muted-foreground flex items-center gap-2 text-sm"
      >
        <Icon className="size-4" aria-hidden />
        {label}
      </label>
    </dt>
  );
}

function TitleField({
  value,
  onSave,
}: {
  value: string;
  onSave: (title: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <textarea
      aria-label="Task title"
      value={draft}
      maxLength={200}
      rows={1}
      onChange={(event) => setDraft(event.target.value.replace(/\n/g, ""))}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape" && draft !== value) {
          event.stopPropagation();
          setDraft(value);
        }
      }}
      onBlur={() => {
        const next = draft.trim();
        if (!next) return setDraft(value);
        if (next !== value) onSave(next);
      }}
      className="hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-ring -mx-2 block w-[calc(100%+1rem)] resize-none rounded-md px-2 py-1 text-xl leading-snug font-semibold tracking-[var(--tracking-heading)] transition-colors outline-none field-sizing-content focus-visible:ring-2"
    />
  );
}

function DescriptionField({
  value,
  onSave,
}: {
  value: string;
  onSave: (description: string | null) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <Textarea
      id="sheet-description"
      value={draft}
      maxLength={10_000}
      placeholder="Add context, links, acceptance criteria…"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft.trim() !== value.trim()) onSave(draft.trim() || null);
      }}
      className="min-h-28 leading-relaxed"
    />
  );
}

function Subtasks({
  task,
  onOpenTask,
}: {
  task: TaskSummary;
  onOpenTask: (taskId: string) => void;
}) {
  const trpc = useTRPC();
  const query = useQuery({
    ...trpc.task.list.queryOptions({
      projectId: task.projectId,
      parentId: task.id,
      sort: "rank",
      limit: 50,
    }),
    enabled: task.subtaskCount.total > 0,
  });

  if (task.subtaskCount.total === 0) return null;
  const { done, total } = task.subtaskCount;

  return (
    <section className="border-t px-6 py-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <ListChecksIcon className="text-muted-foreground size-4" aria-hidden />
        Subtasks
        <span className="text-muted-foreground font-normal tabular-nums">
          {done}/{total}
        </span>
      </h3>
      <div className="bg-muted mb-3 h-1 overflow-hidden rounded-full">
        <div
          className="bg-success h-full rounded-full transition-[width] duration-(--duration-slow)"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
      <ul className="space-y-0.5">
        {query.isPending
          ? Array.from({ length: Math.min(total, 4) }, (_, index) => (
              <li key={index}>
                <Skeleton className="h-8" />
              </li>
            ))
          : query.data?.items.map((subtask) => (
              <li key={subtask.id}>
                <button
                  type="button"
                  onClick={() => onOpenTask(subtask.id)}
                  className="hover:bg-muted focus-visible:ring-ring flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <StatusDot status={subtask.status} />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate",
                      subtask.status.category === "DONE" &&
                        "text-muted-foreground line-through",
                    )}
                  >
                    {subtask.title}
                  </span>
                  <PriorityGlyph priority={subtask.priority} />
                </button>
              </li>
            ))}
      </ul>
    </section>
  );
}

function DeleteButton({
  pending,
  onConfirm,
}: {
  pending: boolean;
  onConfirm: () => void;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <Button
      variant={armed ? "destructive" : "ghost"}
      className={cn(!armed && "text-muted-foreground")}
      disabled={pending}
      onBlur={() => setArmed(false)}
      onClick={() => (armed ? onConfirm() : setArmed(true))}
    >
      {pending ? (
        <Spinner className="size-4" />
      ) : (
        <Trash2Icon className="size-4" aria-hidden />
      )}
      {armed ? "Click again to delete" : "Delete"}
    </Button>
  );
}

function SheetSkeleton() {
  return (
    <div role="status" aria-label="Loading task" className="space-y-6 p-6">
      <SheetTitle className="sr-only">Loading task</SheetTitle>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-7 w-3/4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 flex-1" />
          </div>
        ))}
      </div>
      <Skeleton className="h-28" />
    </div>
  );
}
