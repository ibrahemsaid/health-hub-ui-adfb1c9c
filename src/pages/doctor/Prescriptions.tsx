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

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", medication: "", dosage: "", instructions: "" });

  const loadAll = async () => {
    if (!user) return;
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "patient");
    const ids = (roles || []).map(r => r.user_id);
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("user_id, name").in("user_id", ids)
      : { data: [] as any[] };
    setPatients(profs || []);

    const { data: pres } = await supabase
      .from("prescriptions")
      .select("id, patient_id, medication, dosage, instructions, created_at")
      .eq("doctor_id", user.id)
      .order("created_at", { ascending: false });

    const m = new Map((profs || []).map(p => [p.user_id, p.name]));
    setPrescriptions((pres || []).map(p => ({ ...p, patientName: m.get(p.patient_id) || "Patient" })));
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [user]);

  const handleAdd = async () => {
    if (!form.patientId || !form.medication || !form.dosage) { toast.error("Fill required fields"); return; }
    const { error } = await supabase.from("prescriptions").insert({
      patient_id: form.patientId, doctor_id: user!.id,
      medication: form.medication, dosage: form.dosage, instructions: form.instructions,
    });
    if (error) { toast.error(error.message); return; }
    setForm({ patientId: "", medication: "", dosage: "", instructions: "" });
    setOpen(false);
    toast.success("Prescription added");
    loadAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("prescriptions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Prescription deleted");
    loadAll();
  };

  const columns = [
    { key: "patientName", header: "Patient" },
    { key: "medication", header: "Medication" },
    { key: "dosage", header: "Dosage" },
    { key: "instructions", header: "Instructions", render: (p: any) => <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px] block">{p.instructions}</span> },
    { key: "actions", header: "Actions", render: (p: any) => (
      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    ) },
  ];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">Manage patient prescriptions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Prescription</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Prescription</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select value={form.patientId} onValueChange={v => setForm(f => ({ ...f, patientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>{patients.map(p => <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Medication</Label><Input value={form.medication} onChange={e => setForm(f => ({ ...f, medication: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Dosage</Label><Input value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Instructions</Label><Textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} /></div>
              <Button onClick={handleAdd} className="w-full gradient-bg text-primary-foreground">Save Prescription</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <Skeleton className="h-64" /> : (
        <DataTable data={prescriptions} columns={columns} searchKeys={["patientName", "medication"]} searchPlaceholder="Search prescriptions..." />
      )}
    </div>
  );
}
