"use client";

import { taskViewParser } from "@/lib/task-view-state";
import { useQueryStates } from "nuqs";

export function useTaskViewState() {
  return useQueryStates(taskViewParser, {
    history: "replace",
    // Filters and the open task are client state; the queries refetch on
    // their own, so a server round trip per click buys nothing.
    shallow: true,
  });
}
