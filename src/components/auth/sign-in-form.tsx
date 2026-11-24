"use client";

import { SignInFormData, signInSchema } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailWarningIcon } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { AuthCard, AuthLink } from "./auth-card";
import {
  PasswordInput,
  SocialButtons,
  type SocialProviders,
} from "./auth-fields";

export const SignInForm = ({
  next,
  providers,
}: {
  next: string;
  providers: SocialProviders;
}) => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const submitting = form.formState.isSubmitting;

  const handleSubmit = async (data: SignInFormData) => {
    setFormError(null);
    setUnverified(null);
    await authClient.signIn.email(data, {
      onSuccess: () => {
        router.push(next);
        router.refresh();
      },
      onError: ({ error }) => {
        if (error.code === "EMAIL_NOT_VERIFIED") {
          setUnverified(data.email);
          return;
        }
        setFormError(error.message || "We couldn't sign you in. Try again.");
      },
    });
  };

  async function resend() {
    if (!unverified) return;
    setResending(true);
    const { error } = await authClient.sendVerificationEmail({
      email: unverified,
      callbackURL: next,
    });
    setResending(false);
    if (error) toast.error(error.message ?? "Could not send the email");
    else toast.success(`Verification link sent to ${unverified}`);
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to pick up where you left off."
      footer={
        <>
          New to DailyTM? <AuthLink href="/sign-up">Create an account</AuthLink>
        </>
      }
    >
      <SocialButtons providers={providers} callbackURL={next} />

      {unverified ? (
        <div
          role="alert"
          className="border-warning/40 bg-warning/10 mb-5 flex gap-3 rounded-lg border p-3 text-sm"
        >
          <MailWarningIcon
            className="text-warning mt-0.5 size-4 shrink-0"
            aria-hidden
          />
          <div className="space-y-2">
            <p>
              Verify <span className="font-medium">{unverified}</span> before
              signing in. Check your inbox for the link.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={resending}
              onClick={() => void resend()}
            >
              {resending ? <Spinner className="size-3.5" /> : null}
              Resend verification email
            </Button>
          </div>
        </div>
      ) : null}

      <form
        noValidate
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-5"
      >
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput
                {...field}
                id="password"
                autoComplete="current-password"
                placeholder="Your password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {formError ? (
          <p role="alert" className="text-destructive -mt-1 text-sm">
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={submitting} className="mt-1 h-10">
          {submitting ? <Spinner className="size-4" /> : null}
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
};
