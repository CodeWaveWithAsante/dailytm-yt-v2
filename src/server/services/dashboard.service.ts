import "server-only";

import {
  Prisma,
  StatusCategory,
  TaskPriority,
} from "@/generated/prisma/client";
import db from "@/lib/db";
import { startOfTodayUtc } from "@/lib/task.queries";
import { OrgContext } from "@/lib/validations/auth";
import { visibilityFilter } from "./project.service";

const DAY = 24 * 60 * 60 * 1000;
export const TREND_DAYS = 14;

/** `YYYY-MM-DD` in UTC — the bucket key the trend and the client agree on. */
function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function payloadString(payload: Prisma.JsonValue, key: string) {
  const value =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload[key]
      : undefined;
  return typeof value === "string" ? value : null;
}

export async function overview(ctx: OrgContext) {
  const today = startOfTodayUtc();
  const weekEnd = new Date(today.getTime() + 7 * DAY);
  const trendStart = new Date(today.getTime() - (TREND_DAYS - 1) * DAY);
  const weekAgo = new Date(today.getTime() - 6 * DAY);
  const twoWeeksAgo = new Date(today.getTime() - 13 * DAY);

  // Everything below is scoped to projects this member can see, including the
  // activity feed — its payloads carry task titles.
  const projects = await db.project.findMany({
    where: {
      organizationId: ctx.orgId,
      archivedAt: null,
      ...visibilityFilter(ctx),
    },
    select: { id: true, name: true, color: true, icon: true },
  });
  const projectIds = projects.map((project) => project.id);

  const base: Prisma.TaskWhereInput = {
    organizationId: ctx.orgId,
    projectId: { in: projectIds },
    archivedAt: null,
  };
  const open: Prisma.TaskWhereInput = {
    ...base,
    status: { category: { not: StatusCategory.DONE } },
  };

  const [
    openCount,
    dueThisWeek,
    overdue,
    completedThisWeek,
    completedLastWeek,
    byCategory,
    byPriority,
    byProject,
    doneByProject,
    created,
    completed,
    myTasks,
    activity,
  ] = await Promise.all([
    db.task.count({ where: open }),
    db.task.count({ where: { ...open, dueDate: { gte: today, lt: weekEnd } } }),
    db.task.count({ where: { ...open, dueDate: { lt: today } } }),
    db.task.count({ where: { ...base, completedAt: { gte: weekAgo } } }),
    db.task.count({
      where: { ...base, completedAt: { gte: twoWeeksAgo, lt: weekAgo } },
    }),
    db.workflowStatus.findMany({
      where: { organizationId: ctx.orgId, projectId: { in: projectIds } },
      select: {
        category: true,
        _count: { select: { tasks: { where: { archivedAt: null } } } },
      },
    }),
    db.task.groupBy({ by: ["priority"], where: open, _count: { _all: true } }),
    db.task.groupBy({ by: ["projectId"], where: base, _count: { _all: true } }),
    db.task.groupBy({
      by: ["projectId"],
      where: { ...base, status: { category: StatusCategory.DONE } },
      _count: { _all: true },
    }),
    // ponytail: bucketed in JS; a date_trunc GROUP BY if orgs reach 10k+ tasks
    // a fortnight.
    db.task.findMany({
      where: { ...base, createdAt: { gte: trendStart } },
      select: { createdAt: true },
    }),
    db.task.findMany({
      where: { ...base, completedAt: { gte: trendStart } },
      select: { completedAt: true },
    }),
    db.task.findMany({
      where: { ...open, assigneeId: ctx.member.id },
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { id: "asc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        priority: true,
        dueDate: true,
        project: { select: { id: true, name: true, color: true, icon: true } },
        status: { select: { name: true, color: true } },
      },
    }),
    db.activityEvent.findMany({
      where: { organizationId: ctx.orgId, projectId: { in: projectIds } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        type: true,
        payload: true,
        actorId: true,
        projectId: true,
        createdAt: true,
      },
    }),
  ]);

  const actorIds = [
    ...new Set(activity.map((event) => event.actorId).filter(Boolean)),
  ] as string[];
  const actors = actorIds.length
    ? await db.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true, image: true },
      })
    : [];
  const actorById = new Map(actors.map((actor) => [actor.id, actor]));

  const trend = Array.from({ length: TREND_DAYS }, (_, index) => ({
    day: dayKey(new Date(trendStart.getTime() + index * DAY)),
    created: 0,
    completed: 0,
  }));
  const trendIndex = new Map(trend.map((point, index) => [point.day, index]));
  for (const { createdAt } of created) {
    const at = trendIndex.get(dayKey(createdAt));
    if (at !== undefined) trend[at].created++;
  }
  for (const { completedAt } of completed) {
    const at = completedAt ? trendIndex.get(dayKey(completedAt)) : undefined;
    if (at !== undefined) trend[at].completed++;
  }

  const categories = { TODO: 0, ACTIVE: 0, DONE: 0 } as Record<
    StatusCategory,
    number
  >;
  for (const status of byCategory)
    categories[status.category] += status._count.tasks;

  const priorities = Object.fromEntries(
    Object.values(TaskPriority).map((priority) => [priority, 0]),
  ) as Record<TaskPriority, number>;
  for (const row of byPriority) priorities[row.priority] = row._count._all;

  const doneMap = new Map(
    doneByProject.map((row) => [row.projectId, row._count._all]),
  );
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const projectProgress = byProject
    .map((row) => {
      const done = doneMap.get(row.projectId) ?? 0;
      return {
        ...projectById.get(row.projectId)!,
        total: row._count._all,
        done,
        open: row._count._all - done,
      };
    })
    .sort((a, b) => b.open - a.open || b.total - a.total)
    .slice(0, 5);

  return {
    stats: {
      open: openCount,
      dueThisWeek,
      overdue,
      completedThisWeek,
      completedLastWeek,
    },
    trend,
    categories,
    priorities,
    projectProgress,
    myTasks,
    activity: activity.map((event) => ({
      id: event.id,
      type: event.type,
      createdAt: event.createdAt,
      title: payloadString(event.payload, "title"),
      taskId: payloadString(event.payload, "taskId"),
      projectId: event.projectId,
      actor: event.actorId ? (actorById.get(event.actorId) ?? null) : null,
    })),
  };
}
