import { mockUsers } from "@/data/mockData";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";

export default function PatientList() {
  const patients = mockUsers.filter(u => u.role === "patient");
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
        <p className="text-muted-foreground mt-1">View and search your patients</p>
      </div>
      <DataTable data={patients} columns={columns} searchKeys={["name", "email"]} searchPlaceholder="Search patients..." />
    </div>
  );
}
