import { mockRecords } from "@/data/mockData";
import { Stethoscope } from "lucide-react";

export default function MedicalHistory() {
  const records = mockRecords.filter(r => r.patientId === "4").sort((a, b) => b.visitDate.localeCompare(a.visitDate));

  return (
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Medical History</h1>
        <p className="text-muted-foreground mt-1">Your complete medical timeline</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {records.map((r, i) => (
            <div key={r.id} className="relative pl-12 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Timeline dot */}
              <div className="absolute left-2.5 top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />

              <div className="stat-card">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{r.diagnosis}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{r.visitDate}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{r.doctorName}</p>
                <p className="text-sm text-foreground/80 mt-1">{r.notes}</p>
              </div>
            </div>
          ))}
        </div>

        {records.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No medical records found</p>
          </div>
        )}
      </div>
    </div>
  );
}
