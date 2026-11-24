import type { Metadata } from "next";
import { Landing } from "@/components/marketing/landing";
import { getSession } from "@/lib/authentication";

export const metadata: Metadata = {
  title: "DailyTM — Plan the day. Ship the work.",
  description:
    "The calm, fast task manager for individuals and teams. Custom workflows, boards and lists in sync, and a dashboard that shows what is slipping.",
};

export default async function Home() {
  const session = await getSession();
  return <Landing signedIn={Boolean(session?.user)} />;
}
