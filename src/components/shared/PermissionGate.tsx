"use client";

import { type Role } from "@/lib/constants/roles";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasPermission, canAccessAny, type Permission } from "@/lib/auth/permissions";

interface PermissionGateProps {
  children: React.ReactNode;
  allowRoles?: Role[];
  requirePermission?: Permission;
  requireAnyPermission?: Permission[];
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  allowRoles,
  requirePermission,
  requireAnyPermission,
  fallback = null,
}: PermissionGateProps) {
  const { user, loading } = useCurrentUser();

  if (loading) return null;
  if (!user) return <>{fallback}</>;

  if (allowRoles && !allowRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  if (requirePermission && !hasPermission(user.role, requirePermission)) {
    return <>{fallback}</>;
  }

  if (requireAnyPermission && !canAccessAny(user.role, requireAnyPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
