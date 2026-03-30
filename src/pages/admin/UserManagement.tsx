import { useState } from "react";
import { mockUsers } from "@/data/mockData";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
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
  const [users, setUsers] = useState(mockUsers);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "", phone: "" });

  const handleAdd = () => {
    if (!form.name || !form.email || !form.role) {
      toast.error("Please fill all required fields");
      return;
    }
    setUsers(prev => [...prev, { ...form, id: crypto.randomUUID() }]);
    setForm({ name: "", email: "", role: "", phone: "" });
    setOpen(false);
    toast.success("User added successfully");
  };

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success("User deleted");
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role", render: (u: any) => roleBadge(u.role) },
    { key: "phone", header: "Phone" },
    {
      key: "actions", header: "Actions",
      render: (u: any) => (
        <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)} className="text-destructive hover:text-destructive">
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
          <p className="text-muted-foreground mt-1">Manage all system users</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full gradient-bg text-primary-foreground">Add User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable data={users} columns={columns} searchKeys={["name", "email"]} searchPlaceholder="Search users by name or email..." />
    </div>
  );
}
