import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import StatsCard from "@/components/StatsCard";
import { Users, Stethoscope, UserCircle, FileText, Activity, Pill } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "admin") return <AdminDash />;
  if (user.role === "doctor") return <DoctorDash />;
  return <PatientDash />;
}

function AdminDash() {
  const [stats, setStats] = useState({ users: 0, doctors: 0, patients: 0, admins: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: roles }, { data: rec }] = await Promise.all([
        supabase.from("user_roles").select("role"),
        supabase.from("medical_records").select("id, diagnosis, visit_date, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      const doctors = roles?.filter(r => r.role === "doctor").length || 0;
      const patients = roles?.filter(r => r.role === "patient").length || 0;
      const admins = roles?.filter(r => r.role === "admin").length || 0;
      setStats({ users: roles?.length || 0, doctors, patients, admins });
      setRecent(rec || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="page-container"><Skeleton className="h-32" /></div>;

  const total = Math.max(stats.users, 1);
  return (
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and user management</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Users" value={stats.users} icon={Users} color="primary" />
        <StatsCard title="Total Doctors" value={stats.doctors} icon={Stethoscope} color="accent" />
        <StatsCard title="Total Patients" value={stats.patients} icon={UserCircle} color="success" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="stat-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Recent Medical Records</h3>
          <div className="space-y-3">
            {recent.length === 0 && <p className="text-sm text-muted-foreground">No records yet.</p>}
            {recent.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Activity className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-foreground flex-1">{r.diagnosis}</p>
                <span className="text-xs text-muted-foreground">{r.visit_date}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Role Distribution</h3>
          <div className="space-y-4">
            {[
              { label: "Doctors", count: stats.doctors, color: "bg-primary" },
              { label: "Patients", count: stats.patients, color: "bg-accent" },
              { label: "Admins", count: stats.admins, color: "bg-warning" },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${(item.count / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorDash() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, records: 0, prescriptions: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: recs }, { data: pres }] = await Promise.all([
        supabase.from("medical_records").select("id, patient_id, diagnosis, visit_date").eq("doctor_id", user.id).order("visit_date", { ascending: false }),
        supabase.from("prescriptions").select("id").eq("doctor_id", user.id),
      ]);
      const uniquePatients = new Set((recs || []).map(r => r.patient_id));
      // Fetch patient names
      let withNames: any[] = [];
      if (recs && recs.length > 0) {
        const ids = Array.from(uniquePatients);
        const { data: profs } = await supabase.from("profiles").select("user_id, name").in("user_id", ids);
        const m = new Map((profs || []).map(p => [p.user_id, p.name]));
        withNames = recs.slice(0, 5).map(r => ({ ...r, patientName: m.get(r.patient_id) || "Patient" }));
      }
      setStats({ patients: uniquePatients.size, records: recs?.length || 0, prescriptions: pres?.length || 0 });
      setRecent(withNames);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="page-container"><Skeleton className="h-32" /></div>;

  return (
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Doctor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your patients and records</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="My Patients" value={stats.patients} icon={Users} color="primary" />
        <StatsCard title="Medical Records" value={stats.records} icon={FileText} color="accent" />
        <StatsCard title="Prescriptions" value={stats.prescriptions} icon={Pill} color="success" />
      </div>
      <div className="stat-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Recent Records</h3>
        <div className="space-y-3">
          {recent.length === 0 && <p className="text-sm text-muted-foreground">No records yet.</p>}
          {recent.map(r => (
            <div key={r.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-4 w-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{r.patientName}</p>
                  <span className="text-xs text-muted-foreground">{r.visit_date}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{r.diagnosis}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatientDash() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ visits: 0, prescriptions: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: recs }, { data: pres }] = await Promise.all([
        supabase.from("medical_records").select("id, diagnosis, visit_date, doctor_id").eq("patient_id", user.id).order("visit_date", { ascending: false }),
        supabase.from("prescriptions").select("id").eq("patient_id", user.id),
      ]);
      let withDoc: any[] = [];
      if (recs && recs.length > 0) {
        const ids = Array.from(new Set(recs.map(r => r.doctor_id)));
        const { data: profs } = await supabase.from("profiles").select("user_id, name").in("user_id", ids);
        const m = new Map((profs || []).map(p => [p.user_id, p.name]));
        withDoc = recs.slice(0, 5).map(r => ({ ...r, doctorName: m.get(r.doctor_id) || "Doctor" }));
      }
      setStats({ visits: recs?.length || 0, prescriptions: pres?.length || 0 });
      setRecent(withDoc);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="page-container"><Skeleton className="h-32" /></div>;

  return (
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Patient Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your health overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Visits" value={stats.visits} icon={Activity} color="primary" />
        <StatsCard title="Active Prescriptions" value={stats.prescriptions} icon={Pill} color="accent" />
        <StatsCard title="Profile" value={user?.name?.split(" ")[0] || "—"} icon={UserCircle} color="success" />
      </div>
      <div className="stat-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Recent Visits</h3>
        <div className="space-y-3">
          {recent.length === 0 && <p className="text-sm text-muted-foreground">No visits recorded yet.</p>}
          {recent.map(r => (
            <div key={r.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-accent/10"><Stethoscope className="h-4 w-4 text-accent" /></div>
              <div>
                <p className="font-medium text-foreground">{r.diagnosis}</p>
                <p className="text-sm text-muted-foreground">{r.doctorName} · {r.visit_date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
