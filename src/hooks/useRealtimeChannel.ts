"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { type RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeOptions {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  onEvent: (payload: Record<string, unknown>) => void;
}

export function useRealtimeChannel({ table, event = "*", filter, onEvent }: RealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `${table}-${Date.now()}`;

    channelRef.current = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event, schema: "public", table, filter },
        (payload) => onEvent(payload as Record<string, unknown>)
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, event, filter]);
}
