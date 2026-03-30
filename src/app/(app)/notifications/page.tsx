import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, AlertTriangle, Award, TrendingUp, Users, ClipboardCheck, MessageSquare } from "lucide-react";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const NOTIFICATION_ICONS: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  pto:         { icon: Calendar,       color: "#d4a000", bg: "rgba(255,194,14,0.1)" },
  strike:      { icon: AlertTriangle,  color: "#F15A22", bg: "rgba(241,90,34,0.08)" },
  recognition: { icon: Award,          color: "#2DBDB6", bg: "rgba(45,189,182,0.1)" },
  performance: { icon: TrendingUp,     color: "#007384", bg: "rgba(0,115,132,0.08)" },
  onboarding:  { icon: ClipboardCheck, color: "#2DBDB6", bg: "rgba(45,189,182,0.1)" },
  survey:      { icon: MessageSquare,  color: "#007384", bg: "rgba(0,115,132,0.08)" },
  employee:    { icon: Users,          color: "#007384", bg: "rgba(0,115,132,0.08)" },
};

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

  const notifList = notifications ?? [];
  const unreadCount = notifList.filter(n => !n.is_read).length;
  const totalCount = notifList.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up"}
        badge={unreadCount > 0 ? (
          <Badge className="text-[10px] font-semibold" style={{ backgroundColor: "hsl(188 100% 26%)", color: "white" }}>
            {unreadCount} new
          </Badge>
        ) : undefined}
      />

      {totalCount === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold">No notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">You&apos;re all caught up. Check back later.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifList.map((n) => {
            const typeConfig = NOTIFICATION_ICONS[n.type] ?? { icon: Bell, color: "#8E9089", bg: "rgba(0,0,0,0.04)" };
            const TypeIcon = typeConfig.icon;

            return (
              <Card
                key={n.id}
                className={cn("transition-shadow hover:shadow-sm", !n.is_read && "border-l-2")}
                style={!n.is_read ? { borderLeftColor: "hsl(188 100% 26%)" } : {}}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: typeConfig.bg }}
                    >
                      <TypeIcon className="h-4 w-4" style={{ color: typeConfig.color }} />
                    </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
