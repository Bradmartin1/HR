"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Role } from "@/lib/constants/roles";

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  employeeId: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("email, full_name, avatar_url, roles(name)")
        .eq("id", authUser.id)
        .single();

      const { data: employeeData } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", authUser.id)
        .single();

      if (userData) {
        setUser({
          id: authUser.id,
          email: userData.email,
          role: (userData.roles as { name: string }).name as Role,
          employeeId: employeeData?.id ?? null,
          fullName: userData.full_name,
          avatarUrl: userData.avatar_url,
        });
      }
      setLoading(false);
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
