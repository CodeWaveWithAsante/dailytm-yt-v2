import { StatusCategory } from "@/generated/prisma/enums";
import { TokenColor } from "./token-colors";

export const DEFAULT_WORKFLOW_STATUSES: readonly {
  name: string;
  color: TokenColor;
  category: StatusCategory;
  position: number;
}[] = [
  {
    name: "Backlog",
    color: "slate",
    category: StatusCategory.TODO,
    position: 0,
  },
  { name: "To do", color: "slate", category: StatusCategory.TODO, position: 1 },
  {
    name: "In progress",
    color: "blue",
    category: StatusCategory.ACTIVE,
    position: 2,
  },
  {
    name: "In review",
    color: "violet",
    category: StatusCategory.ACTIVE,
    position: 3,
  },
  {
    name: "Blocked",
    color: "rose",
    category: StatusCategory.ACTIVE,
    position: 4,
  },
  {
    name: "Completed",
    color: "green",
    category: StatusCategory.DONE,
    position: 5,
  },
] as const;
