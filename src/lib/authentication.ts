import "server-only";

import { redirect } from "next/navigation";
import { auth } from "./auth";
import { headers } from "next/headers";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function redirectIfSignedIn() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");
}
