import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Pill } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("prescriptions")
        .select("id, medication, dosage, instructions, created_at")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });
      setPrescriptions(data || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="page-container"><Skeleton className="h-64" /></div>;

  return (
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">My Prescriptions</h1>
        <p className="text-muted-foreground mt-1">Your active medications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prescriptions.map((p, i) => (
          <div key={p.id} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Pill className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{p.medication}</h3>
                <p className="text-sm font-medium text-primary mt-1">{p.dosage}</p>
                <p className="text-sm text-muted-foreground mt-2">{p.instructions}</p>
              </div>
            </div>
          </div>
        ))}

        {prescriptions.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No prescriptions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
