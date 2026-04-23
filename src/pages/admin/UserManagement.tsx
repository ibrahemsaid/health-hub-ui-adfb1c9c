import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    admin: "bg-warning/10 text-warning border-warning/20",
    doctor: "bg-primary/10 text-primary border-primary/20",
    patient: "bg-accent/10 text-accent border-accent/20",
  };
  return <Badge variant="outline" className={map[role] || ""}>{role}</Badge>;
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("user_id, name, email, phone"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));
    const merged = (profs || []).map(p => ({ ...p, id: p.user_id, role: roleMap.get(p.user_id) || "patient" }));
    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) { toast.error("You cannot delete yourself"); return; }
    // Deleting the profile cascades; auth.users record stays but that's acceptable for admin UI.
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("User removed");
    load();
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role", render: (u: any) => roleBadge(u.role) },
    { key: "phone", header: "Phone" },
    {
      key: "actions", header: "Actions",
      render: (u: any) => (
        <Button variant="ghost" size="sm" onClick={() => handleDelete(u.user_id)} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">View all system users</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        New users register themselves via the public sign-up page (Patient or Doctor).
      </p>
      {loading ? <Skeleton className="h-64" /> : (
        <DataTable data={users} columns={columns} searchKeys={["name", "email"]} searchPlaceholder="Search users by name or email..." />
      )}
    </div>
  );
}
