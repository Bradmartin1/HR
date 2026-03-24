import { createClient } from "@/lib/supabase/server";
import { type Role } from "@/lib/constants/roles";

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  employeeId: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userData } = await supabase
    .from("users")
    .select(`
      id, email, full_name, avatar_url,
      roles(name)
    `)
    .eq("id", user.id)
    .single();

  if (!userData) return null;

  const { data: employeeData } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", user.id)
    .single();

  return {
    id: user.id,
    email: userData.email,
    role: (userData.roles as { name: string }).name as Role,
    employeeId: employeeData?.id ?? null,
    fullName: userData.full_name,
    avatarUrl: userData.avatar_url,
  };
}
