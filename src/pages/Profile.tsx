import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });

  const handleSave = () => {
    updateProfile(form);
    toast.success("Profile updated successfully");
  };

  return (
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">Update your personal information</p>
      </div>

      <div className="max-w-lg">
        <div className="stat-card space-y-5">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="Enter new password" />
          </div>
          <Button onClick={handleSave} className="gradient-bg text-primary-foreground">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
