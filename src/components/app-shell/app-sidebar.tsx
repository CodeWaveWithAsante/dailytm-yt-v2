"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { FolderKanbanIcon, LayoutDashboardIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
} from "../ui/sidebar";
import Link from "next/link";
import { OrgSwitcher } from "./org-switcher";
import { UserMenu } from "./user-menu";
import { ProjectGlyph } from "../project/project-client";

export type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
  role: string;
  memberCount: number;
};

export type ShellUser = {
  name: string;
  email: string;
  image: string | null;
};

type AppSidebarType = {
  organizations: OrganizationOption[];
  activeOrgId: string;
  orgSlug: string;
  user: ShellUser;
};

export const AppSidebar = ({
  activeOrgId,
  orgSlug,
  organizations,
  user,
}: AppSidebarType) => {
  const pathname = usePathname();
  const trpc = useTRPC();
  const projects = useQuery(trpc.project.list.queryOptions({ limit: 12 }));

  // ponytail: My Tasks / Calendar / Inbox / Settings links removed until those
  // routes exist — they all 404'd.
  const items = [
    {
      href: `/${orgSlug}`,
      label: "Dashboard",
      Icon: LayoutDashboardIcon,
      exact: true,
    },
    { href: `/${orgSlug}/projects`, label: "Projects", Icon: FolderKanbanIcon },
  ];

  const isActive = (href: string, exact = false) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <OrgSwitcher organizations={organizations} activeId={activeOrgId} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ href, label, Icon, exact }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(href, exact)}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon aria-hidden />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Your projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.isPending
                ? Array.from({ length: 3 }, (_, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  ))
                : projects.data?.items.map((project) => {
                    const href = `/${orgSlug}/projects/${project.id}`;
                    return (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton
                          asChild
                          size="sm"
                          isActive={isActive(href)}
                        >
                          <Link href={href}>
                            <ProjectGlyph
                              color={project.color}
                              icon={project.icon}
                              size="sm"
                            />
                            <span>{project.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
