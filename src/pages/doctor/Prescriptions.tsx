import { useState } from "react";
import { mockPrescriptions, mockUsers } from "@/data/mockData";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientName: "", medication: "", dosage: "", instructions: "" });

  const handleAdd = () => {
    if (!form.medication || !form.dosage) { toast.error("Fill required fields"); return; }
    setPrescriptions(prev => [...prev, { id: crypto.randomUUID(), recordId: "", ...form }]);
    setForm({ patientName: "", medication: "", dosage: "", instructions: "" });
    setOpen(false);
    toast.success("Prescription added");
  };

  const columns = [
    { key: "patientName", header: "Patient" },
    { key: "medication", header: "Medication" },
    { key: "dosage", header: "Dosage" },
    { key: "instructions", header: "Instructions", render: (p: any) => <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px] block">{p.instructions}</span> },
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
              <div className="space-y-2"><Label>Patient Name</Label><Input value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Medication</Label><Input value={form.medication} onChange={e => setForm(f => ({ ...f, medication: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Dosage</Label><Input value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Instructions</Label><Textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} /></div>
              <Button onClick={handleAdd} className="w-full gradient-bg text-primary-foreground">Save Prescription</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable data={prescriptions} columns={columns} searchKeys={["patientName", "medication"]} searchPlaceholder="Search prescriptions..." />
    </div>
  );
}
