import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "patient");
      const ids = (roles || []).map(r => r.user_id);
      if (ids.length === 0) { setLoading(false); return; }
      const { data: profs } = await supabase.from("profiles").select("user_id, name, email, phone").in("user_id", ids);
      setPatients(profs || []);
      setLoading(false);
    })();
  }, []);

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "status", header: "Status", render: () => <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge> },
  ];

  return (
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Patients</h1>
        <p className="text-muted-foreground mt-1">View and search registered patients</p>
      </div>
      {loading ? <Skeleton className="h-64" /> : (
        <DataTable data={patients} columns={columns} searchKeys={["name", "email"]} searchPlaceholder="Search patients..." />
      )}
    </div>
  );
}
