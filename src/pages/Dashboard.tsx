import { useAuth } from "@/contexts/AuthContext";
import StatsCard from "@/components/StatsCard";
import { Users, Stethoscope, UserCircle, FileText, Activity, Pill } from "lucide-react";
import { mockUsers, mockRecords, mockPrescriptions } from "@/data/mockData";

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDash />;
  if (user?.role === "doctor") return <DoctorDash />;
  return <PatientDash />;
}

function AdminDash() {
  const doctors = mockUsers.filter(u => u.role === "doctor").length;
  const patients = mockUsers.filter(u => u.role === "patient").length;

  return (
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and user management</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Users" value={mockUsers.length} icon={Users} color="primary" trend="+12% this month" />
        <StatsCard title="Total Doctors" value={doctors} icon={Stethoscope} color="accent" trend="+2 this month" />
        <StatsCard title="Total Patients" value={patients} icon={UserCircle} color="success" trend="+8 this month" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="stat-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              "New patient Emily Davis registered",
              "Dr. Sarah Johnson added a medical record",
              "System backup completed successfully",
              "New prescription added for John Smith",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Activity className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Role Distribution</h3>
          <div className="space-y-4">
            {[
              { label: "Doctors", count: doctors, total: mockUsers.length, color: "bg-primary" },
              { label: "Patients", count: patients, total: mockUsers.length, color: "bg-accent" },
              { label: "Admins", count: 1, total: mockUsers.length, color: "bg-warning" },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${(item.count / item.total) * 100}%` }} />
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
  return (
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Doctor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your patients and records</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="My Patients" value={4} icon={Users} color="primary" />
        <StatsCard title="Medical Records" value={mockRecords.length} icon={FileText} color="accent" />
        <StatsCard title="Prescriptions" value={mockPrescriptions.length} icon={Pill} color="success" />
      </div>
      <div className="stat-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Recent Records</h3>
        <div className="space-y-3">
          {mockRecords.slice(0, 4).map(r => (
            <div key={r.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{r.patientName}</p>
                  <span className="text-xs text-muted-foreground">{r.visitDate}</span>
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
  const myRecords = mockRecords.filter(r => r.patientId === "4").slice(0, 3);

  return (
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Patient Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your health overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Visits" value={myRecords.length} icon={Activity} color="primary" />
        <StatsCard title="Active Prescriptions" value={2} icon={Pill} color="accent" />
        <StatsCard title="Next Appointment" value="Apr 5" icon={FileText} color="success" />
      </div>
      <div className="stat-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Recent Visits</h3>
        <div className="space-y-3">
          {myRecords.map(r => (
            <div key={r.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-accent/10">
                <Stethoscope className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">{r.diagnosis}</p>
                <p className="text-sm text-muted-foreground">{r.doctorName} · {r.visitDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
