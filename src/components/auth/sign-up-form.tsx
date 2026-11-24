"use client";

import { SignUpFormData, signUpSchema } from "@/lib/validations/auth";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { AuthCard, AuthLink } from "./auth-card";
import {
  PasswordInput,
  PasswordStrength,
  SocialButtons,
  type SocialProviders,
} from "./auth-fields";

export const SignUpForm = ({
  next,
  providers,
}: {
  next: string;
  providers: SocialProviders;
}) => {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", name: "" },
  });
  const submitting = form.formState.isSubmitting;
  const password = useWatch({ control: form.control, name: "password" });

  const handleSubmit = async (data: SignUpFormData) => {
    setFormError(null);
    await authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: next,
      },
      {
        onSuccess: () => setSentTo(data.email),
        onError: ({ error }) =>
          setFormError(error.message || "We couldn't create your account."),
      },
    );
  };

  async function resend() {
    if (!sentTo) return;
    setResending(true);
    const { error } = await authClient.sendVerificationEmail({
      email: sentTo,
      callbackURL: next,
    });
    setResending(false);
    if (error) toast.error(error.message ?? "Could not send the email");
    else toast.success("Sent again — give it a minute.");
  }

  if (sentTo) {
    return (
      <div className="animate-in fade-in-0 zoom-in-95 text-center duration-300">
        <span className="bg-primary/10 text-primary mx-auto mb-6 grid size-14 place-items-center rounded-2xl">
          <MailCheckIcon className="size-6" aria-hidden />
        </span>
        <AuthCard
          title="Check your inbox"
          description={`We sent a verification link to ${sentTo}. Open it to activate your account — it signs you straight in.`}
          footer={
            <>
              Wrong address?{" "}
              <button
                type="button"
                onClick={() => setSentTo(null)}
                className="text-foreground hover:text-primary font-medium underline underline-offset-4"
              >
                Start over
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="h-10"
              disabled={resending}
              onClick={() => void resend()}
            >
              {resending ? <Spinner className="size-4" /> : null}
              Resend email
            </Button>
            <Button asChild variant="ghost" className="h-10">
              <Link href="/sign-in">Back to sign in</Link>
            </Button>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      description="Free for individuals and small teams. No card required."
      footer={
        <>
          Already have an account? <AuthLink href="/sign-in">Sign in</AuthLink>
        </>
      }
    >
      <SocialButtons providers={providers} callbackURL={next} />

      <form
        noValidate
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-5"
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                {...field}
                id="name"
                autoComplete="name"
                placeholder="Ama Kwarteng"
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Work email</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                aria-invalid={fieldState.invalid}
              />
              <PasswordStrength value={password} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm password
              </FieldLabel>
              <PasswordInput
                {...field}
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Type it once more"
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
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
};
