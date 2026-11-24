"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import {
  ArchiveIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  FolderKanbanIcon,
  GlobeIcon,
  LockIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { nextCursor } from "@/lib/task.queries";
import { ProjectSummary } from "@/trpc/types";
import Link from "next/link";
import {
  PROJECT_ICON_COMPONENTS,
  projectColorClasses,
  projectIconKey,
} from "@/lib/project-appearance";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { Skeleton } from "../ui/skeleton";

export const ProjectClient = ({
  orgSlug,
  view,
  includeArchived,
  onCreate,
}: {
  orgSlug: string;
  view: "card" | "list";
  includeArchived: boolean;
  onCreate: () => void;
}) => {
  const trpc = useTRPC();

  const query = useSuspenseInfiniteQuery(
    trpc.project.list.infiniteQueryOptions(
      { includeArchived, limit: 50 },
      { getNextPageParam: nextCursor },
    ),
  );

  const projects = query.data.pages.flatMap((page) => page.items);

  if (projects.length === 0) {
    return (
      <Empty className="flex-1 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderKanbanIcon aria-hidden />
          </EmptyMedia>
          <EmptyTitle>
            {includeArchived ? "No projects at all yet" : "No active projects"}
          </EmptyTitle>
          <EmptyDescription>
            {includeArchived
              ? "A project holds your team's tasks and keeps the board and list in sync."
              : "Create one to get started, or show archived projects to bring one back."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onCreate}>
            <PlusIcon className="size-4" aria-hidden />
            Create a project
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div
      key={view}
      className="animate-in fade-in-0 slide-in-from-bottom-1 flex flex-col gap-4 duration-300"
    >
      {view === "card" ? (
        <CardView orgSlug={orgSlug} projects={projects} />
      ) : (
        <ListView orgSlug={orgSlug} projects={projects} />
      )}

      {query.hasNextPage ? (
        <Button
          variant="outline"
          className="self-center"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? "Loading…" : "Load more projects"}
        </Button>
      ) : null}
    </div>
  );
};

function percent(project: ProjectSummary) {
  const total = project.taskCount.tasks;
  return total === 0 ? 0 : Math.round((project.doneCount / total) * 100);
}

function ProgressBar({
  value,
  color,
  className,
}: {
  value: number;
  color: string;
  className?: string;
}) {
  const { text } = projectColorClasses(color);
  return (
    <span
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Tasks done"
      className={cn(
        "bg-muted block h-1.5 overflow-hidden rounded-full",
        className,
      )}
    >
      <span
        className={cn(
          "block h-full rounded-full bg-current transition-[width] duration-(--duration-slow) ease-(--ease-out-quart)",
          text,
        )}
        style={{ width: `${value}%` }}
      />
    </span>
  );
}

function Visibility({ value }: { value: ProjectSummary["visibility"] }) {
  const restricted = value === "RESTRICTED";
  const Icon = restricted ? LockIcon : GlobeIcon;
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
      <Icon className="size-3.5" aria-hidden />
      {restricted ? "Restricted" : "Open"}
    </span>
  );
}

function ArchivedBadge() {
  return (
    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium">
      <ArchiveIcon className="size-3" aria-hidden />
      Archived
    </span>
  );
}

const CardView = ({
  orgSlug,
  projects,
}: {
  orgSlug: string;
  projects: ProjectSummary[];
}) => {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project, index) => {
        const done = percent(project);
        return (
          <li
            key={project.id}
            className="animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <Link
              href={`/${orgSlug}/projects/${project.id}`}
              className="group bg-card focus-visible:ring-ring hover:border-foreground/15 relative flex h-full flex-col rounded-xl border p-4 shadow-xs transition-[border-color,box-shadow,transform] duration-(--duration-normal) hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
            >
              <div className="flex items-start gap-3">
                <ProjectGlyph
                  color={project.color}
                  icon={project.icon}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{project.name}</span>
                    {project.archivedAt ? <ArchivedBadge /> : null}
                  </h3>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    <TaskCount count={project.taskCount.tasks} />
                  </p>
                </div>

                <ArrowRightIcon
                  aria-hidden
                  className="text-muted-foreground size-4 shrink-0 -translate-x-1 opacity-0 transition-[opacity,transform] duration-(--duration-fast) group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                />
              </div>

              <p className="text-muted-foreground mt-3 line-clamp-2 min-h-10 text-xs leading-5">
                {project.description || "No description yet."}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Visibility value={project.visibility} />
                  <span className="text-muted-foreground tabular-nums">
                    {done}% done
                  </span>
                </div>
                <ProgressBar value={done} color={project.color} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

const LIST_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_5rem_7rem_8rem_1rem]";

const ListView = ({
  orgSlug,
  projects,
}: {
  orgSlug: string;
  projects: ProjectSummary[];
}) => {
  const now = new Date();

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-xs">
      <div
        aria-hidden
        className={cn(
          LIST_GRID,
          "bg-muted/40 text-muted-foreground hidden h-9 border-b px-4 text-[11px] font-medium tracking-wide md:grid",
        )}
      >
        <span>Project</span>
        <span>Progress</span>
        <span className="text-right">Tasks</span>
        <span>Access</span>
        <span>Updated</span>
        <span />
      </div>

      <ul className="divide-y">
        {projects.map((project, index) => {
          const done = percent(project);
          return (
            <li
              key={project.id}
              className="animate-in fade-in-0 fill-mode-both duration-300"
              style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
            >
              <Link
                href={`/${orgSlug}/projects/${project.id}`}
                className={cn(
                  LIST_GRID,
                  "group hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-ring min-h-14 px-4 py-2.5 transition-colors duration-(--duration-fast) focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <ProjectGlyph
                    color={project.color}
                    icon={project.icon}
                    size="md"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {project.name}
                      </span>
                      {project.archivedAt ? <ArchivedBadge /> : null}
                    </span>
                    {project.description ? (
                      <span className="text-muted-foreground block truncate text-xs">
                        {project.description}
                      </span>
                    ) : null}
                  </span>
                </span>

                <span className="hidden items-center gap-3 md:flex">
                  <ProgressBar
                    value={done}
                    color={project.color}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground w-9 text-right text-xs tabular-nums">
                    {done}%
                  </span>
                </span>

                <span className="text-muted-foreground hidden text-right text-sm tabular-nums md:block">
                  {project.doneCount}/{project.taskCount.tasks}
                </span>

                <span className="hidden md:block">
                  <Visibility value={project.visibility} />
                </span>

                <span
                  className="text-muted-foreground hidden text-xs md:block"
                  suppressHydrationWarning
                >
                  {formatRelative(project.updatedAt, now)}
                </span>

                <ChevronRightIcon
                  aria-hidden
                  className="text-muted-foreground size-4 -translate-x-1 opacity-40 transition-[opacity,transform] duration-(--duration-fast) group-hover:translate-x-0 group-hover:opacity-100"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export function ProjectListSkeleton({ view }: { view: "card" | "list" }) {
  if (view === "list") {
    return (
      <div
        className="bg-card overflow-hidden rounded-xl border"
        role="status"
        aria-label="Loading projects"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex h-14 items-center gap-3 border-b px-4 last:border-0"
          >
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="h-3 w-48" />
            <span className="flex-1" />
            <Skeleton className="hidden h-1.5 w-40 md:block" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Loading projects"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-44 rounded-xl" />
      ))}
    </div>
  );
}

export function ProjectGlyph({
  color,
  icon,
  size = "md",
  className,
}: {
  color: string;
  icon: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = PROJECT_ICON_COMPONENTS[projectIconKey(icon)];
  const { text } = projectColorClasses(color);

  return (
    <span
      aria-hidden
      className={cn(
        // The tint is `currentColor` at low alpha, so the square and the glyph
        // cannot drift apart when a colour token moves.
        "inline-flex shrink-0 items-center justify-center rounded-md bg-current/12",
        text,
        size === "sm" && "size-5",
        size === "md" && "size-7",
        size === "lg" && "size-9",
        className,
      )}
    >
      <Icon
        className={cn(
          size === "sm" && "size-3",
          size === "md" && "size-4",
          size === "lg" && "size-5",
        )}
      />
    </span>
  );
}

function TaskCount({ count }: { count: number }) {
  if (count === 0) return <>No tasks yet</>;
  return (
    <>
      {count} {count === 1 ? "task" : "tasks"}
    </>
  );
}
