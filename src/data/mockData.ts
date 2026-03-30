export const mockUsers = [
  { id: "1", name: "Dr. Admin", email: "admin@health.com", role: "admin", phone: "+1234567890" },
  { id: "2", name: "Dr. Sarah Johnson", email: "sarah@health.com", role: "doctor", phone: "+1234567891" },
  { id: "3", name: "Dr. Michael Lee", email: "michael@health.com", role: "doctor", phone: "+1234567893" },
  { id: "4", name: "John Smith", email: "john@health.com", role: "patient", phone: "+1234567892" },
  { id: "5", name: "Emily Davis", email: "emily@health.com", role: "patient", phone: "+1234567894" },
  { id: "6", name: "Robert Wilson", email: "robert@health.com", role: "patient", phone: "+1234567895" },
  { id: "7", name: "Alice Brown", email: "alice@health.com", role: "patient", phone: "+1234567896" },
  { id: "8", name: "Dr. James White", email: "james@health.com", role: "doctor", phone: "+1234567897" },
];

export const mockRecords = [
  { id: "r1", patientId: "4", patientName: "John Smith", doctorName: "Dr. Sarah Johnson", diagnosis: "Type 2 Diabetes", notes: "Blood sugar levels elevated. Prescribed Metformin.", visitDate: "2026-03-28" },
  { id: "r2", patientId: "5", patientName: "Emily Davis", doctorName: "Dr. Sarah Johnson", diagnosis: "Hypertension", notes: "Blood pressure 150/95. Started on Lisinopril.", visitDate: "2026-03-25" },
  { id: "r3", patientId: "4", patientName: "John Smith", doctorName: "Dr. Michael Lee", diagnosis: "Annual Checkup", notes: "All vitals normal. Recommended vitamin D supplement.", visitDate: "2026-03-15" },
  { id: "r4", patientId: "6", patientName: "Robert Wilson", doctorName: "Dr. Sarah Johnson", diagnosis: "Bronchitis", notes: "Persistent cough for 2 weeks. Chest X-ray clear.", visitDate: "2026-03-10" },
  { id: "r5", patientId: "7", patientName: "Alice Brown", doctorName: "Dr. James White", diagnosis: "Migraine", notes: "Recurring headaches. MRI ordered.", visitDate: "2026-03-05" },
];

export const mockPrescriptions = [
  { id: "p1", recordId: "r1", patientName: "John Smith", medication: "Metformin", dosage: "500mg twice daily", instructions: "Take with meals. Monitor blood sugar." },
  { id: "p2", recordId: "r2", patientName: "Emily Davis", medication: "Lisinopril", dosage: "10mg once daily", instructions: "Take in the morning. Avoid potassium supplements." },
  { id: "p3", recordId: "r4", patientName: "Robert Wilson", medication: "Amoxicillin", dosage: "500mg three times daily", instructions: "Complete the full 7-day course." },
  { id: "p4", recordId: "r1", patientName: "John Smith", medication: "Vitamin D3", dosage: "2000 IU daily", instructions: "Take with food." },
  { id: "p5", recordId: "r5", patientName: "Alice Brown", medication: "Sumatriptan", dosage: "50mg as needed", instructions: "Take at onset of migraine. Max 2 doses per day." },
];
