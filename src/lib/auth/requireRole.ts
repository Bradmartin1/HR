import { type Role } from "@/lib/constants/roles";
import { createClient } from "@/lib/supabase/server";

export class PermissionError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "PermissionError";
  }
}

export async function requireRole(allowedRoles: Role[]): Promise<{ userId: string; role: Role }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new PermissionError("Not authenticated");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();

  if (!userData) {
    throw new PermissionError("User not found");
  }

  const roleName = (userData.roles as { name: string } | null)?.name as Role | undefined;

  if (!roleName || !allowedRoles.includes(roleName)) {
    throw new PermissionError(`Role '${roleName}' is not authorized for this action`);
  }

  return { userId: user.id, role: roleName };
}

export async function getCurrentRole(): Promise<Role | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("roles(name)")
    .eq("id", user.id)
    .single();

  return ((data?.roles as { name: string } | null)?.name as Role) ?? null;
}
