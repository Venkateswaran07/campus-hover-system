import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications((data as Notification[]) || []);
  };

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel("user-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    for (const id of unreadIds) {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    }
    fetchNotifications();
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllRead(); }}
        className="shadow-raised-sm rounded-lg p-2 bg-background transition-shadow-neu hover:shadow-inset cursor-pointer relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-72 shadow-raised rounded-xl bg-background z-50 overflow-hidden">
          <div className="p-3 border-b border-border">
            <p className="font-outfit font-semibold text-sm text-foreground">Notifications</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground text-sm font-outfit">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-3 border-b border-border last:border-0 ${!n.read ? "bg-muted/30" : ""}`}>
                  <p className="text-sm font-outfit font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground font-outfit">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground font-mono-data mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
