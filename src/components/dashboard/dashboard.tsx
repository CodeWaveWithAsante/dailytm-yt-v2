"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CircleDotIcon,
  FolderKanbanIcon,
  InboxIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative } from "@/lib/format";
import { startOfTodayUtc } from "@/lib/task.queries";
import { TASK_PRIORITIES, TASK_PRIORITY_META } from "@/lib/task-view-state";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { ProjectGlyph } from "../project/project-client";
import {
  AssigneeAvatar,
  DueDate,
  PriorityGlyph,
  StatusPill,
} from "../project/task/task-badges";

type Overview = inferRouterOutputs<AppRouter>["dashboard"]["overview"];

const stagger = (index: number) =>
  ({ animationDelay: `${index * 50}ms` }) as CSSProperties;

export function Dashboard({
  orgSlug,
  userName,
}: {
  orgSlug: string;
  userName: string;
}) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.dashboard.overview.queryOptions());
  const today = startOfTodayUtc();
  const firstName = userName.split(/\s+/)[0] || "there";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <header className="animate-in fade-in-0 slide-in-from-bottom-1 duration-500">
        <h1
          className="text-2xl font-semibold tracking-[var(--tracking-heading)]"
          suppressHydrationWarning
        >
          {greeting()}, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {summaryLine(data.stats)}
        </p>
      </header>

      <section
        aria-label="Key numbers"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <StatTile
          index={0}
          Icon={CircleDotIcon}
          label="Open tasks"
          value={data.stats.open}
          hint="Across your projects"
        />
        <StatTile
          index={1}
          Icon={CalendarClockIcon}
          label="Due this week"
          value={data.stats.dueThisWeek}
          hint="Next 7 days"
        />
        <StatTile
          index={2}
          Icon={AlertTriangleIcon}
          label="Overdue"
          value={data.stats.overdue}
          hint={data.stats.overdue ? "Needs attention" : "Nothing late"}
          tone={data.stats.overdue ? "danger" : undefined}
        />
        <StatTile
          index={3}
          Icon={CheckCircle2Icon}
          label="Completed"
          value={data.stats.completedThisWeek}
          hint={
            <Delta
              now={data.stats.completedThisWeek}
              before={data.stats.completedLastWeek}
            />
          }
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          index={4}
          className="lg:col-span-2"
          title="Created vs completed"
          description="Last 14 days"
        >
          <TrendChart trend={data.trend} />
        </Panel>

        <div className="grid gap-4">
          <Panel
            index={5}
            title="Where work sits"
            description="All tasks by status"
          >
            <CategoryBar categories={data.categories} />
          </Panel>
          <Panel index={6} title="Open by priority">
            <PriorityBars priorities={data.priorities} />
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          index={7}
          className="lg:col-span-2"
          title="My tasks"
          description="Assigned to you, soonest due first"
          action={
            <Link
              href={`/${orgSlug}/projects`}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              All projects
            </Link>
          }
        >
          <MyTasks tasks={data.myTasks} orgSlug={orgSlug} today={today} />
        </Panel>

        <Panel index={8} title="Project progress">
          <ProjectProgress projects={data.projectProgress} orgSlug={orgSlug} />
        </Panel>
      </div>

      <Panel index={9} title="Recent activity">
        <Activity events={data.activity} orgSlug={orgSlug} />
      </Panel>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function summaryLine(stats: Overview["stats"]) {
  if (stats.open === 0) return "Nothing open right now — a clean slate.";
  const parts = [`${stats.dueThisWeek} due this week`];
  if (stats.overdue) parts.push(`${stats.overdue} overdue`);
  return `You have ${stats.open} open ${stats.open === 1 ? "task" : "tasks"}: ${parts.join(", ")}.`;
}

/* ─── Building blocks ─────────────────────────────────────────────────── */

function Panel({
  title,
  description,
  action,
  children,
  className,
  index,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  index: number;
}) {
  return (
    <section
      style={stagger(index)}
      className={cn(
        "bg-card animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both flex flex-col rounded-xl border p-5 shadow-xs duration-500",
        className,
      )}
    >
      <header className="mb-4 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-medium">{title}</h2>
          {description ? (
            <p className="text-muted-foreground mt-0.5 text-xs">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

function StatTile({
  Icon,
  label,
  value,
  hint,
  tone,
  index,
}: {
  Icon: LucideIcon;
  label: string;
  value: number;
  hint: ReactNode;
  tone?: "danger";
  index: number;
}) {
  return (
    <div
      style={stagger(index)}
      className={cn(
        "bg-card animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both rounded-xl border p-4 shadow-xs duration-500",
        tone === "danger" && "border-destructive/30",
      )}
    >
      <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
        <Icon
          aria-hidden
          className={cn("size-4", tone === "danger" && "text-destructive")}
        />
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[var(--tracking-display)] tabular-nums">
        {value}
      </p>
      <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
    </div>
  );
}

function Delta({ now, before }: { now: number; before: number }) {
  if (now === before) return <>Same as last week</>;
  const up = now > before;
  const Icon = up ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon
        aria-hidden
        className={cn("size-3.5", up ? "text-success" : "text-destructive")}
      />
      {Math.abs(now - before)} {up ? "more" : "fewer"} than last week
    </span>
  );
}

function EmptyNote({
  Icon,
  children,
}: {
  Icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-sm">
      <Icon className="size-5 opacity-60" aria-hidden />
      {children}
    </div>
  );
}

/* ─── Trend ───────────────────────────────────────────────────────────── */

// Validated pair (light + dark) — see `--chart-1` / `--chart-3`. The tritan gap
// sits in the 6–8 floor band in dark mode, so Created is also dashed.
const trendConfig = {
  completed: { label: "Completed", color: "var(--chart-1)" },
  created: { label: "Created", color: "var(--chart-3)" },
} satisfies ChartConfig;

const dayLabel = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const formatDay = (day: string) =>
  dayLabel.format(new Date(`${day}T00:00:00Z`));

function TrendChart({ trend }: { trend: Overview["trend"] }) {
  const totals = trend.reduce(
    (sum, point) => ({
      created: sum.created + point.created,
      completed: sum.completed + point.completed,
    }),
    { created: 0, completed: 0 },
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-xs" aria-hidden>
        <LegendItem
          swatch="bg-chart-1"
          label="Completed"
          value={totals.completed}
        />
        <LegendItem dashed label="Created" value={totals.created} />
      </div>

      {totals.created + totals.completed === 0 ? (
        <EmptyNote Icon={InboxIcon}>
          No tasks created or completed in the last 14 days.
        </EmptyNote>
      ) : (
        <ChartContainer
          config={trendConfig}
          className="aspect-auto h-60 w-full"
        >
          <ComposedChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fill-completed" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.28}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={formatDay}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) => formatDay(String(value))}
                />
              }
            />
            <Area
              dataKey="completed"
              type="monotone"
              stroke="var(--color-completed)"
              strokeWidth={2}
              fill="url(#fill-completed)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            />
            <Line
              dataKey="created"
              type="monotone"
              stroke="var(--color-created)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            />
          </ComposedChart>
        </ChartContainer>
      )}

      <table className="sr-only">
        <caption>Tasks created and completed per day, last 14 days</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Created</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {trend.map((point) => (
            <tr key={point.day}>
              <td>{formatDay(point.day)}</td>
              <td>{point.created}</td>
              <td>{point.completed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function LegendItem({
  swatch,
  dashed,
  label,
  value,
}: {
  swatch?: string;
  dashed?: boolean;
  label: string;
  value: number;
}) {
  return (
    <span className="text-muted-foreground inline-flex items-center gap-2">
      {dashed ? (
        <span className="border-chart-3 w-4 border-t-2 border-dashed" />
      ) : (
        <span className={cn("h-2 w-4 rounded-sm", swatch)} />
      )}
      {label}
      <span className="text-foreground font-medium tabular-nums">{value}</span>
    </span>
  );
}

/* ─── Breakdown ───────────────────────────────────────────────────────── */

const CATEGORY_META = [
  { key: "TODO", label: "To do", color: "bg-project-slate" },
  { key: "ACTIVE", label: "In progress", color: "bg-project-blue" },
  { key: "DONE", label: "Done", color: "bg-project-green" },
] as const;

function CategoryBar({ categories }: { categories: Overview["categories"] }) {
  const total = categories.TODO + categories.ACTIVE + categories.DONE;
  if (total === 0) return <EmptyNote Icon={InboxIcon}>No tasks yet.</EmptyNote>;

  return (
    <div className="space-y-4">
      {/* 2px surface gaps between segments; labels carry identity, not colour. */}
      <div
        className="flex h-2.5 gap-0.5 overflow-hidden rounded-full"
        aria-hidden
      >
        {CATEGORY_META.map(({ key, color }) =>
          categories[key] ? (
            <span
              key={key}
              className={cn(
                "h-full transition-[flex-grow] duration-(--duration-slow)",
                color,
              )}
              style={{ flexGrow: categories[key] }}
            />
          ) : null,
        )}
      </div>
      <ul className="grid grid-cols-3 gap-2 text-xs">
        {CATEGORY_META.map(({ key, label, color }) => (
          <li key={key}>
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span className={cn("size-2 rounded-sm", color)} aria-hidden />
              {label}
            </span>
            <span className="mt-1 block text-base font-semibold tabular-nums">
              {categories[key]}
              <span className="text-muted-foreground ml-1 text-xs font-normal">
                {Math.round((categories[key] / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriorityBars({ priorities }: { priorities: Overview["priorities"] }) {
  const max = Math.max(...Object.values(priorities), 1);
  const ordered = [...TASK_PRIORITIES].reverse();
  return (
    <ul className="space-y-2.5">
      {ordered.map((priority) => (
        <li
          key={priority}
          className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 text-xs"
        >
          <span className="flex items-center gap-2">
            <PriorityGlyph priority={priority} />
            {TASK_PRIORITY_META[priority].label}
          </span>
          <span className="bg-muted h-1.5 overflow-hidden rounded-full">
            <span
              className="bg-chart-1 block h-full rounded-full transition-[width] duration-(--duration-slow)"
              style={{ width: `${(priorities[priority] / max) * 100}%` }}
            />
          </span>
          <span className="text-right font-medium tabular-nums">
            {priorities[priority]}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ─── Lists ───────────────────────────────────────────────────────────── */

function MyTasks({
  tasks,
  orgSlug,
  today,
}: {
  tasks: Overview["myTasks"];
  orgSlug: string;
  today: Date;
}) {
  if (tasks.length === 0) {
    return (
      <EmptyNote Icon={CheckCircle2Icon}>
        Nothing assigned to you. Enjoy the calm.
      </EmptyNote>
    );
  }
  return (
    <ul className="-mx-2 divide-y">
      {tasks.map((task) => (
        <li key={task.id}>
          <Link
            href={`/${orgSlug}/projects/${task.project.id}?task=${task.id}`}
            className="hover:bg-muted/50 focus-visible:ring-ring flex min-h-12 items-center gap-3 rounded-md px-2 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <PriorityGlyph priority={task.priority} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {task.title}
              </span>
              <span className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                <ProjectGlyph
                  color={task.project.color}
                  icon={task.project.icon}
                  size="sm"
                />
                <span className="truncate">{task.project.name}</span>
              </span>
            </span>
            <StatusPill
              status={task.status}
              className="hidden sm:inline-flex"
            />
            {task.dueDate ? (
              <DueDate date={task.dueDate} today={today} />
            ) : (
              <span className="text-muted-foreground text-[11px]">No date</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ProjectProgress({
  projects,
  orgSlug,
}: {
  projects: Overview["projectProgress"];
  orgSlug: string;
}) {
  if (projects.length === 0) {
    return (
      <EmptyNote Icon={FolderKanbanIcon}>
        Projects with tasks show up here.
      </EmptyNote>
    );
  }
  return (
    <ul className="space-y-4">
      {projects.map((project) => {
        const percent = project.total
          ? Math.round((project.done / project.total) * 100)
          : 0;
        return (
          <li key={project.id}>
            <Link
              href={`/${orgSlug}/projects/${project.id}`}
              className="group focus-visible:ring-ring block rounded-md focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="flex items-center gap-2 text-sm">
                <ProjectGlyph
                  color={project.color}
                  icon={project.icon}
                  size="sm"
                />
                <span className="group-hover:text-foreground min-w-0 flex-1 truncate font-medium">
                  {project.name}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {project.done}/{project.total}
                </span>
              </span>
              <span className="bg-muted mt-2 block h-1.5 overflow-hidden rounded-full">
                <span
                  className="bg-chart-1 block h-full rounded-full transition-[width] duration-(--duration-slow)"
                  style={{ width: `${percent}%` }}
                />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const VERBS: Record<string, string> = {
  "task.created": "created",
  "task.updated": "updated",
  "task.moved": "moved",
  "task.deleted": "deleted",
  "project.created": "created project",
  "project.updated": "updated project",
  "project.archived": "archived project",
};

function Activity({
  events,
  orgSlug,
}: {
  events: Overview["activity"];
  orgSlug: string;
}) {
  if (events.length === 0) {
    return (
      <EmptyNote Icon={InboxIcon}>
        Activity from your team will appear here.
      </EmptyNote>
    );
  }
  const now = new Date();
  return (
    <ol className="space-y-3">
      {events.map((event) => {
        const who = event.actor?.name ?? "Someone";
        const verb = VERBS[event.type] ?? event.type.replace(".", " ");
        const title = event.title ? `“${event.title}”` : null;
        return (
          <li key={event.id} className="flex items-center gap-3 text-sm">
            <AssigneeAvatar
              name={who}
              image={event.actor?.image ?? null}
              className="size-6"
            />
            <p className="min-w-0 flex-1 truncate">
              <span className="font-medium">{who}</span>{" "}
              <span className="text-muted-foreground">{verb}</span>{" "}
              {title && event.taskId && event.projectId ? (
                <Link
                  href={`/${orgSlug}/projects/${event.projectId}?task=${event.taskId}`}
                  className="hover:text-primary underline-offset-4 transition-colors hover:underline"
                >
                  {title}
                </Link>
              ) : (
                title
              )}
            </p>
            <time
              className="text-muted-foreground shrink-0 text-xs"
              dateTime={event.createdAt.toISOString()}
              suppressHydrationWarning
            >
              {formatRelative(event.createdAt, now)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}

export function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6"
    >
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
