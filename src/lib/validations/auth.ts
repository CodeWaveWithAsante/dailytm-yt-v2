import z from "zod";
import { Session } from "../auth";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters long");

const email = z
  .email("Enter a valid email address")
  .max(200, "That email address is too long");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter your name")
      .max(80, "That name is too long"),
    email,
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Those passwords do not match",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(80, "That name is too long"),
  organizationName: z
    .string()
    .trim()
    .min(1, "Name your organization")
    .max(80, "That name is too long"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export type ProtectedContext = {
  session: Session;
  userId: string;
};

export type OrgContext = ProtectedContext & {
  orgId: string;
  role: string;
  member: {
    id: string;
    role: string;
    userId: string;
    organizationId: string;
    createdAt: Date;
  };
};

export function slugify(value: string): string {
  return (
    value
      .normalize("NFKD")
      // Strip the combining marks NFKD just split off, so "Café" becomes "cafe".
      // Escaped as a Unicode property, not a literal character range: a literal
      // combining range is invisible in a diff and trivially broken by an editor.
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48)
  );
}
