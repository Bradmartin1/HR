import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, is_read, created_at, link")
    .eq("recipient_id", session.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const unreadCount = (notifications ?? []).filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up"}
      />

      {!notifications || notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">You&apos;re all caught up. Check back later.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={cn("transition-shadow hover:shadow-sm", !n.is_read && "border-l-2")}
              style={!n.is_read ? { borderLeftColor: "hsl(188 100% 26%)" } : {}}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: !n.is_read ? "hsl(188 100% 26%)" : "transparent" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm", n.is_read ? "text-muted-foreground" : "font-medium text-foreground")}>{n.title}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{formatRelative(n.created_at)}</span>
                    </div>
                    {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
