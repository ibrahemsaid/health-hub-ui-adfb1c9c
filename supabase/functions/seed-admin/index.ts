import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const seedUsers = [
      { email: "admin@health.com", password: "admin123", name: "Dr. Admin", phone: "+1234567890", role: "admin" },
      { email: "doctor@health.com", password: "doctor123", name: "Dr. Sarah Johnson", phone: "+1234567891", role: "doctor" },
      { email: "patient@health.com", password: "patient123", name: "John Smith", phone: "+1234567892", role: "patient" },
      { email: "patient2@health.com", password: "patient123", name: "Emily Davis", phone: "+1234567893", role: "patient" },
    ];

    const ids: Record<string, string> = {};

    for (const u of seedUsers) {
      // try to find existing
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list.users.find((x: any) => x.email === u.email);
      let userId = existing?.id;

      if (!existing) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: { name: u.name, phone: u.phone, role: u.role === "admin" ? "patient" : u.role },
        });
        if (error) throw new Error(`Create ${u.email}: ${error.message}`);
        userId = data.user!.id;
      }

      // Ensure correct role (overwrite for admin)
      await supabase.from("user_roles").delete().eq("user_id", userId);
      await supabase.from("user_roles").insert({ user_id: userId, role: u.role });

      // Ensure profile exists/updated
      await supabase.from("profiles").upsert(
        { user_id: userId, name: u.name, email: u.email, phone: u.phone },
        { onConflict: "user_id" }
      );

      ids[u.email] = userId!;
    }

    const doctorId = ids["doctor@health.com"];
    const p1 = ids["patient@health.com"];
    const p2 = ids["patient2@health.com"];

    // Seed records only if none for these patients
    const { data: existingRecs } = await supabase
      .from("medical_records")
      .select("id")
      .in("patient_id", [p1, p2]);

    if (!existingRecs || existingRecs.length === 0) {
      const { data: recs } = await supabase.from("medical_records").insert([
        { patient_id: p1, doctor_id: doctorId, diagnosis: "Hypertension", notes: "Monitor blood pressure weekly.", visit_date: "2025-01-15" },
        { patient_id: p1, doctor_id: doctorId, diagnosis: "Seasonal Allergies", notes: "Antihistamines recommended.", visit_date: "2025-03-22" },
        { patient_id: p2, doctor_id: doctorId, diagnosis: "Type 2 Diabetes", notes: "Diet and exercise plan provided.", visit_date: "2025-02-10" },
      ]).select();

      if (recs) {
        await supabase.from("prescriptions").insert([
          { record_id: recs[0].id, patient_id: p1, doctor_id: doctorId, medication: "Lisinopril", dosage: "10mg daily", instructions: "Take with water in the morning." },
          { record_id: recs[1].id, patient_id: p1, doctor_id: doctorId, medication: "Cetirizine", dosage: "10mg daily", instructions: "Take as needed for allergy symptoms." },
          { record_id: recs[2].id, patient_id: p2, doctor_id: doctorId, medication: "Metformin", dosage: "500mg twice daily", instructions: "Take with meals." },
        ]);
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Seed complete", users: Object.keys(ids) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
