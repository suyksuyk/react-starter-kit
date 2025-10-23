/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import type { QueryClient } from "@tanstack/react-query";
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";

// User data type from API
export interface User {
  id: string;
  name: string;
  email: string;
  email_verified?: boolean;
  created_at?: string;
  provider_id?: string;
  account_id?: string;
}

// Team member data type
export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  created_at: string;
  name?: string;
  email?: string;
}

// User with team info
export interface UserWithTeam extends User {
  team_members?: TeamMember[];
  role?: string;
  status?: "Active" | "Inactive";
  lastActive?: string;
}

// Query key for users data
export const usersQueryKey = ["users"] as const;

// Query key for team members
export const teamMembersQueryKey = ["team-members"] as const;

// Users query options factory
export function usersQueryOptions() {
  return queryOptions<User[]>({
    queryKey: usersQueryKey,
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/users", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const data = await response.json();
        return data.users || [];
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    },
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60_000, // 5 minutes
  });
}

// Team members query options factory
export function teamMembersQueryOptions() {
  return queryOptions<TeamMember[]>({
    queryKey: teamMembersQueryKey,
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/debug-tables", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch team members: ${response.statusText}`,
          );
        }

        const data = await response.json();
        return data.tables?.team_members || [];
      } catch (error) {
        console.error("Error fetching team members:", error);
        throw error;
      }
    },
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60_000, // 5 minutes
  });
}

// Combined query for users with team info
export function usersWithTeamQueryOptions() {
  return queryOptions<UserWithTeam[]>({
    queryKey: [...usersQueryKey, "with-team"],
    queryFn: async () => {
      const [users, teamMembers] = await Promise.all([
        fetch("/api/admin/users", {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }).then((res) => {
          if (!res.ok)
            throw new Error(`Failed to fetch users: ${res.statusText}`);
          return res.json();
        }),
        fetch("/api/admin/debug-tables", {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }).then((res) => {
          if (!res.ok)
            throw new Error(`Failed to fetch team members: ${res.statusText}`);
          return res.json();
        }),
      ]);

      const usersData = users.users || [];
      const teamMembersData = teamMembers.tables?.team_members || [];

      // Combine users with their team memberships
      return usersData.map((user: User) => {
        const userTeamMembers = teamMembersData.filter(
          (tm: TeamMember) => tm.user_id === user.id,
        );

        // Determine role based on email or team membership
        let role = "Viewer";
        if (user.email === "admin@example.com") {
          role = "Admin";
        } else if (userTeamMembers.length > 0) {
          role = "Editor";
        }

        // Mock status and last active (would come from database in real implementation)
        const status = user.email_verified ? "Active" : "Inactive";
        const lastActive = "2 hours ago"; // Mock data

        return {
          ...user,
          team_members: userTeamMembers,
          role,
          status,
          lastActive,
        };
      });
    },
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60_000, // 5 minutes
  });
}

// Hook for using users data
export function useUsersQuery() {
  return useQuery(usersQueryOptions());
}

// Hook for using users data with suspense
export function useSuspenseUsersQuery() {
  return useSuspenseQuery(usersQueryOptions());
}

// Hook for using users with team data
export function useUsersWithTeamQuery() {
  return useQuery(usersWithTeamQueryOptions());
}

// Hook for using users with team data (suspense)
export function useSuspenseUsersWithTeamQuery() {
  return useSuspenseQuery(usersWithTeamQueryOptions());
}

// Hook for using team members data
export function useTeamMembersQuery() {
  return useQuery(teamMembersQueryOptions());
}

// Prefetch users data
export async function prefetchUsers(queryClient: QueryClient) {
  return queryClient.prefetchQuery(usersQueryOptions());
}

// Invalidate users cache
export async function invalidateUsers(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: usersQueryKey });
}

// Invalidate team members cache
export async function invalidateTeamMembers(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: teamMembersQueryKey });
}
