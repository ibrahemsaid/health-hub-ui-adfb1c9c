import { useState } from "react";
import { mockRecords, mockUsers } from "@/data/mockData";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function MedicalRecords() {
  const [records, setRecords] = useState(mockRecords);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", diagnosis: "", notes: "", visitDate: "" });
  const patients = mockUsers.filter(u => u.role === "patient");

  const handleAdd = () => {
    if (!form.patientId || !form.diagnosis || !form.visitDate) { toast.error("Fill required fields"); return; }
    const patient = patients.find(p => p.id === form.patientId);
    setRecords(prev => [...prev, {
      id: crypto.randomUUID(), patientId: form.patientId, patientName: patient?.name || "",
      doctorName: "Dr. Sarah Johnson", diagnosis: form.diagnosis, notes: form.notes, visitDate: form.visitDate,
    }]);
    setForm({ patientId: "", diagnosis: "", notes: "", visitDate: "" });
    setOpen(false);
    toast.success("Record added");
  };

  const columns = [
    { key: "patientName", header: "Patient" },
    { key: "diagnosis", header: "Diagnosis" },
    { key: "visitDate", header: "Visit Date" },
    { key: "notes", header: "Notes", render: (r: any) => <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px] block">{r.notes}</span> },
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
                  <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
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
      <DataTable data={records} columns={columns} searchKeys={["patientName", "diagnosis"]} searchPlaceholder="Search records..." />
    </div>
  );
}
