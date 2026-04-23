import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", diagnosis: "", notes: "", visitDate: "" });

  const loadAll = async () => {
    if (!user) return;
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "patient");
    const ids = (roles || []).map(r => r.user_id);
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("user_id, name").in("user_id", ids)
      : { data: [] as any[] };
    setPatients(profs || []);

    const { data: recs } = await supabase
      .from("medical_records")
      .select("id, patient_id, diagnosis, notes, visit_date")
      .eq("doctor_id", user.id)
      .order("visit_date", { ascending: false });

    const m = new Map((profs || []).map(p => [p.user_id, p.name]));
    setRecords((recs || []).map(r => ({ ...r, patientName: m.get(r.patient_id) || "Patient" })));
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [user]);

  const handleAdd = async () => {
    if (!form.patientId || !form.diagnosis || !form.visitDate) { toast.error("Fill required fields"); return; }
    const { error } = await supabase.from("medical_records").insert({
      patient_id: form.patientId, doctor_id: user!.id,
      diagnosis: form.diagnosis, notes: form.notes, visit_date: form.visitDate,
    });
    if (error) { toast.error(error.message); return; }
    setForm({ patientId: "", diagnosis: "", notes: "", visitDate: "" });
    setOpen(false);
    toast.success("Record added");
    loadAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("medical_records").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Record deleted");
    loadAll();
  };

  const columns = [
    { key: "patientName", header: "Patient" },
    { key: "diagnosis", header: "Diagnosis" },
    { key: "visit_date", header: "Visit Date" },
    { key: "notes", header: "Notes", render: (r: any) => <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px] block">{r.notes}</span> },
    { key: "actions", header: "Actions", render: (r: any) => (
      <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    ) },
  ];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Medical Records</h1>
          <p className="text-muted-foreground mt-1">Manage patient medical records</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New Record</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Medical Record</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select value={form.patientId} onValueChange={v => setForm(f => ({ ...f, patientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>{patients.map(p => <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Visit Date</Label><Input type="date" value={form.visitDate} onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))} /></div>
              <Button onClick={handleAdd} className="w-full gradient-bg text-primary-foreground">Save Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <Skeleton className="h-64" /> : (
        <DataTable data={records} columns={columns} searchKeys={["patientName", "diagnosis"]} searchPlaceholder="Search records..." />
      )}
    </div>
  );
}
