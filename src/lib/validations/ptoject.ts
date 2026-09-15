import z from "zod";
import { PROJECT_COLORS, PROJECT_ICONS } from "../project-appearance";
import { ProjectVisibility } from "@/generated/prisma/enums";

const projectName = z
  .string()
  .trim()
  .min(1, "Give the project a name")
  .max(120, "That name is too long");

const projectDescription = z
  .string()
  .trim()
  .max(2000, "That description is too long")
  .nullish();

const projectColor = z.enum(PROJECT_COLORS);
const projectIcon = z.enum(PROJECT_ICONS);

export const createProjectInput = z.object({
  name: projectName,
  description: projectDescription,
  color: projectColor.default("indigo"),
  icon: projectIcon.default("folder"),
  visibility: z.enum(ProjectVisibility).default(ProjectVisibility.OPEN),
});

export const updateProjectInput = z
  .object({
    projectId: z.string().min(1),
    name: projectName.optional(),
    description: projectDescription,
    color: projectColor.optional(),
    icon: projectIcon.optional(),
    visibility: z.enum(ProjectVisibility).optional(),
  })
  .refine(
    (input) =>
      Object.entries(input).some(
        ([field, value]) => field !== "projectId" && value !== undefined,
      ),
    { message: "Nothing to update" },
  );

export const setProjectArchivedInput = z.object({
  projectId: z.string().min(1),
  archived: z.boolean(),
});
