import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { roleLabel, type AppRole } from "@/hooks/useAuthProfile";

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  requested_role: AppRole;
  status: string;
};

export function SupervisorView() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [enroll, setEnroll] = useState<{ courseId: string; studentId: string }>({
    courseId: "",
    studentId: "",
  });

  const { data: profiles } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async (): Promise<ProfileRow[]> => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, requested_role, status")
        .order("created_at", { ascending: false });
      return (data ?? []) as ProfileRow[];
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, code, name, teacher_id")
        .order("name");
      return data ?? [];
    },
  });

  const { data: enrollments } = useQuery({
    queryKey: ["all-enrollments"],
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("id, course_id, student_id");
      return data ?? [];
    },
  });

  const decide = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage(null);
      queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const createCourse = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("courses").insert({
        code: courseCode.trim(),
        name: courseName.trim(),
        teacher_id: teacherId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage(null);
      setCourseCode("");
      setCourseName("");
      setTeacherId("");
      queryClient.invalidateQueries({ queryKey: ["all-courses"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const addEnrollment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("enrollments")
        .insert({ course_id: enroll.courseId, student_id: enroll.studentId });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage(null);
      setEnroll({ courseId: "", studentId: "" });
      queryClient.invalidateQueries({ queryKey: ["all-enrollments"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const all = profiles ?? [];
  const pending = all.filter((p) => p.status === "pending");
  const teachers = all.filter((p) => p.status === "approved" && p.requested_role === "enseignant");
  const students = all.filter((p) => p.status === "approved" && p.requested_role === "etudiant");

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="mb-6 font-display text-3xl font-semibold">Demandes d'inscription</h1>
        {message ? (
          <p className="mb-4 rounded-2xl bg-rose/30 px-4 py-3 text-sm font-semibold">{message}</p>
        ) : null}
        {pending.length === 0 ? (
          <div className="clay rounded-[2rem] bg-card p-8 text-sm font-semibold text-muted-foreground">
            Aucune demande en attente.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((p) => (
              <div key={p.id} className="clay rounded-3xl bg-card p-6">
                <h2 className="font-display text-xl font-semibold">{p.full_name || p.email}</h2>
                <p className="text-sm font-semibold text-muted-foreground">{p.email}</p>
                <span className="mt-3 inline-block rounded-full bg-brand/10 px-3 py-1 text-sm font-bold text-brand">
                  {roleLabel[p.requested_role]}
                </span>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => decide.mutate({ id: p.id, status: "approved" })}
                    className="clay rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => decide.mutate({ id: p.id, status: "rejected" })}
                    className="clay rounded-full bg-card px-5 py-2.5 text-sm font-bold"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="clay rounded-[2rem] bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Créer un cours</h2>
          <div className="mt-4 grid gap-3">
            <input
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="Code (ex. MATH101)"
              className="rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none"
            />
            <input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Intitulé du cours"
              className="rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none"
            />
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none"
            >
              <option value="">Enseignant (optionnel)</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name || t.email}
                </option>
              ))}
            </select>
            <button
              disabled={!courseCode.trim() || !courseName.trim() || createCourse.isPending}
              onClick={() => createCourse.mutate()}
              className="clay rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground disabled:opacity-50"
            >
              Ajouter le cours
            </button>
          </div>
        </div>

        <div className="clay rounded-[2rem] bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Inscrire un étudiant</h2>
          <div className="mt-4 grid gap-3">
            <select
              value={enroll.courseId}
              onChange={(e) => setEnroll((s) => ({ ...s, courseId: e.target.value }))}
              className="rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none"
            >
              <option value="">Choisir un cours</option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
            <select
              value={enroll.studentId}
              onChange={(e) => setEnroll((s) => ({ ...s, studentId: e.target.value }))}
              className="rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none"
            >
              <option value="">Choisir un étudiant</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.email}
                </option>
              ))}
            </select>
            <button
              disabled={!enroll.courseId || !enroll.studentId || addEnrollment.isPending}
              onClick={() => addEnrollment.mutate()}
              className="clay rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground disabled:opacity-50"
            >
              Inscrire
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-display text-2xl font-semibold">Cours</h2>
        {(courses ?? []).length === 0 ? (
          <div className="clay rounded-[2rem] bg-card p-8 text-sm font-semibold text-muted-foreground">
            Aucun cours créé.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(courses ?? []).map((c) => {
              const teacher = all.find((p) => p.id === c.teacher_id);
              const count = (enrollments ?? []).filter((e) => e.course_id === c.id).length;
              return (
                <div key={c.id} className="clay rounded-3xl bg-card p-6">
                  <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    {c.code}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold">{c.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    {teacher ? teacher.full_name || teacher.email : "Sans enseignant"}
                  </p>
                  <span className="mt-3 inline-block rounded-full bg-mint/30 px-3 py-1 text-sm font-bold">
                    {count} élève{count > 1 ? "s" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
