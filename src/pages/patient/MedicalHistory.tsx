import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MedicalHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: recs } = await supabase
        .from("medical_records")
        .select("id, diagnosis, notes, visit_date, doctor_id")
        .eq("patient_id", user.id)
        .order("visit_date", { ascending: false });

      let withDoc: any[] = [];
      if (recs && recs.length > 0) {
        const ids = Array.from(new Set(recs.map(r => r.doctor_id)));
        const { data: profs } = await supabase.from("profiles").select("user_id, name").in("user_id", ids);
        const m = new Map((profs || []).map(p => [p.user_id, p.name]));
        withDoc = recs.map(r => ({ ...r, doctorName: m.get(r.doctor_id) || "Doctor" }));
      }
      setRecords(withDoc);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="page-container"><Skeleton className="h-64" /></div>;

  return (
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Medical History</h1>
        <p className="text-muted-foreground mt-1">Your complete medical timeline</p>
      </div>

      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-6">
          {records.map((r, i) => (
            <div key={r.id} className="relative pl-12 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="absolute left-2.5 top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />
              <div className="stat-card">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{r.diagnosis}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{r.visit_date}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{r.doctorName}</p>
                <p className="text-sm text-foreground/80 mt-1">{r.notes}</p>
              </div>
            </div>
          ))}
        </div>

        {records.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No medical records found</p>
          </div>
        )}
      </div>
    </div>
  );
}
