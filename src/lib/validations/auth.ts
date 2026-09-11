import z from "zod";

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

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
