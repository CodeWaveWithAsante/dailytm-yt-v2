"use client";

import { Suspense, useState } from "react";
import { Button } from "../ui/button";
import {
  LayoutGridIcon,
  ListIcon,
  PlusIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from "nuqs";
import { Switch } from "../ui/switch";
import { ProjectClient, ProjectListSkeleton } from "./project-client";
import { CreateProjectForm } from "./create-project-form";

const PROJECT_VIEW = ["card", "list"] as const;

/**
 * A two-or-three way segmented control. Radio semantics, so arrow keys move
 * between options and a screen reader announces "Card, selected, 1 of 2".
 */
export function ViewToggle<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly { value: T; label: string; Icon: LucideIcon }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="bg-muted inline-flex shrink-0 items-center gap-0.5 rounded-lg p-0.5"
      onKeyDown={(event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const index = options.findIndex((option) => option.value === value);
        const step = event.key === "ArrowRight" ? 1 : -1;
        const next = options[(index + step + options.length) % options.length];
        onChange(next.value);
        event.currentTarget
          .querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
          ?.focus();
      }}
    >
      {options.map(({ value: option, label: optionLabel, Icon }) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            data-value={option}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option)}
            className={cn(
              "focus-visible:ring-ring inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm transition-[color,background-color,box-shadow] duration-(--duration-fast) focus-visible:ring-2 focus-visible:outline-none",
              active
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            <span>{optionLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

const VIEW_OPTIONS = [
  { value: "card", label: "Cards", Icon: LayoutGridIcon },
  { value: "list", label: "List", Icon: ListIcon },
] as const;

export const ProjectView = ({ orgSlug }: { orgSlug: string }) => {
  const [creating, setCreating] = useState(false);

  const [view, setView] = useQueryState(
    "pview",
    parseAsStringLiteral(PROJECT_VIEW)
      .withDefault("card")
      .withOptions({ history: "replace" }),
  );

  const [includeArchived, setIncludeArchived] = useQueryState(
    "archived",
    parseAsBoolean.withDefault(false).withOptions({ history: "replace" }),
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-[var(--tracking-heading)]">
            Projects
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every project in this workspace you can see.
          </p>
        </div>

        <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
          <Switch
            checked={includeArchived}
            onCheckedChange={(check) => void setIncludeArchived(check)}
          />
          Show archived
        </label>

        <ViewToggle
          label="Project layout"
          value={view}
          options={VIEW_OPTIONS}
          onChange={(next) => void setView(next)}
        />

        <Button onClick={() => setCreating(true)} className="h-9">
          <PlusIcon className="size-4" aria-hidden />
          New project
        </Button>
      </div>

      <Suspense fallback={<ProjectListSkeleton view={view} />}>
        <ProjectClient
          includeArchived={includeArchived}
          orgSlug={orgSlug}
          onCreate={() => setCreating(true)}
          view={view}
        />
      </Suspense>

      <CreateProjectForm
        orgSlug={orgSlug}
        open={creating}
        onOpenChange={setCreating}
      />
    </>
  );
};
