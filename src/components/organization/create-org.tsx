"use client";

import {
  OnboardingFormData,
  onboardingSchema,
  slugify,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Spinner } from "../ui/spinner";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const NewOrganization = ({ defaultName }: { defaultName: string }) => {
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: defaultName,
      organizationName: "",
    },
  });

  const router = useRouter();

  const submitting = form.formState.isSubmitting;

  const handleSubmit = async (values: OnboardingFormData) => {
    if (values.name !== defaultName) {
      const { error: nameError } = await authClient.updateUser({
        name: values.name,
      });

      if (nameError) {
        toast.error("We could not update your name");
        return;
      }
    }

    const slug = await availableSlug(slugify(values.organizationName));

    const { error: createError } = await authClient.organization.create({
      name: values.organizationName,
      slug,
      keepCurrentActiveOrganization: false,
    });

    if (createError) {
      toast.error("We could not create the organization. Try again");

      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-5"
    >
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="org-owner-name">Your name</FieldLabel>
            <Input {...field} id="org-owner-name" autoComplete="name" />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="organizationName"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="org-name">Organization name</FieldLabel>
            <Input
              {...field}
              id="org-name"
              autoFocus
              placeholder="Acme Inc."
              aria-describedby="organization-hint"
            />
            {fieldState.error ? (
              <FieldError errors={[fieldState.error]} />
            ) : (
              <p
                id="organization-hint"
                className="text-muted-foreground text-xs"
              >
                {field.value
                  ? `Your workspace will live at /${slugify(field.value)}`
                  : "Your team, department, or company. You can rename it later."}
              </p>
            )}
          </Field>
        )}
      />

      <Button type="submit" disabled={submitting} className="h-10 w-full">
        {submitting ? <Spinner className="size-4" /> : null}
        {submitting ? "Creating workspace…" : "Create organization"}
      </Button>
    </form>
  );
};

async function availableSlug(base: string): Promise<string> {
  const candidate = base || "workspace";

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? candidate : `${candidate}-${attempt + 1}`;
    const { data } = await authClient.organization.checkSlug({ slug });
    if (data?.status) return slug;
  }

  return `${candidate}-${Math.random().toString(36).slice(2, 7)}`;
}
