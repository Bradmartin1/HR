"use client";

import { useCurrentUser } from "./useCurrentUser";
import { hasPermission, canAccess, canAccessAny, type Permission } from "@/lib/auth/permissions";

export function usePermissions() {
  const { user } = useCurrentUser();

  return {
    can: (permission: Permission) =>
      user ? hasPermission(user.role, permission) : false,
    canAll: (permissions: Permission[]) =>
      user ? canAccess(user.role, permissions) : false,
    canAny: (permissions: Permission[]) =>
      user ? canAccessAny(user.role, permissions) : false,
    role: user?.role ?? null,
  };
}
