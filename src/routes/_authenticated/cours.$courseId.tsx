import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/cours/$courseId")({
  head: () => ({
    meta: [
      { title: "Détail du cours — Scolaria" },
      { name: "description", content: "Liste des étudiants inscrits et de leurs notes." },
      { property: "og:title", content: "Détail du cours — Scolaria" },
      { property: "og:description", content: "Saisissez et consultez les notes de vos étudiants." },
    ],
  }),
  component: CourseDetail,
});

type Student = {
  id: string;
  name: string;
  email: string;
  grades: { id: string; label: string; score: number }[];
};

function CourseDetail() {
  const { courseId } = Route.useParams();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, { label: string; score: string }>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: async () => {
      const { data: course } = await supabase
        .from("courses")
        .select("id, code, name")
        .eq("id", courseId)
        .maybeSingle();

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("student_id")
        .eq("course_id", courseId);

      const ids = (enrollments ?? []).map((e) => e.student_id);

      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, full_name, email").in("id", ids)
        : { data: [] as { id: string; full_name: string; email: string }[] };

      const { data: grades } = await supabase
        .from("grades")
        .select("id, student_id, label, score")
        .eq("course_id", courseId);

      const students: Student[] = ids.map((id) => {
        const p = (profiles ?? []).find((x) => x.id === id);
        return {
          id,
          name: p?.full_name || p?.email || "Étudiant",
          email: p?.email ?? "",
          grades: (grades ?? [])
            .filter((g) => g.student_id === id)
            .map((g) => ({ id: g.id, label: g.label, score: Number(g.score) })),
        };
      });

      return { course, students };
    },
  });

  const addGrade = useMutation({
    mutationFn: async (studentId: string) => {
      const entry = form[studentId];
      const score = Number(entry?.score);
      if (!entry?.score || Number.isNaN(score) || score < 0 || score > 20) {
        throw new Error("La note doit être comprise entre 0 et 20.");
      }
      const { error } = await supabase.from("grades").insert({
        course_id: courseId,
        student_id: studentId,
        label: entry.label.trim() || "Évaluation",
        score,
      });
      if (error) throw error;
    },
    onSuccess: (_d, studentId) => {
      setMessage(null);
      setForm((f) => ({ ...f, [studentId]: { label: "", score: "" } }));
      queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  if (isLoading) {
    return (
      <AppShell>
        <p className="text-sm font-semibold text-muted-foreground">Chargement du cours…</p>
      </AppShell>
    );
  }

  const course = data?.course;
  const students = data?.students ?? [];

  return (
    <AppShell {...(course?.code ? { subtitle: course.code } : {})}>
      <Link
        to="/dashboard"
        className="mb-5 inline-block text-sm font-bold text-muted-foreground hover:text-foreground"
      >
        ← Retour à mes cours
      </Link>
      <h1 className="mb-6 font-display text-3xl font-semibold">
        {course?.name ?? "Cours introuvable"}
      </h1>

      {message ? (
        <p className="mb-4 rounded-2xl bg-rose/30 px-4 py-3 text-sm font-semibold">{message}</p>
      ) : null}

      {students.length === 0 ? (
        <div className="clay rounded-[2rem] bg-card p-8 text-sm font-semibold text-muted-foreground">
          Aucun étudiant inscrit à ce cours.
        </div>
      ) : (
        <div className="grid gap-5">
          {students.map((s) => {
            const average =
              s.grades.length > 0
                ? s.grades.reduce((sum, g) => sum + g.score, 0) / s.grades.length
                : null;
            const entry = form[s.id] ?? { label: "", score: "" };
            return (
              <div key={s.id} className="clay rounded-3xl bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold">{s.name}</h2>
                    <p className="text-sm font-semibold text-muted-foreground">{s.email}</p>
                  </div>
                  <span className="rounded-full bg-mint/30 px-3 py-1 text-sm font-bold">
                    {average !== null ? `${average.toFixed(2)}/20` : "—"}
                  </span>
                </div>

                <div className="mt-4 grid gap-2">
                  {s.grades.length === 0 ? (
                    <p className="text-sm font-semibold text-muted-foreground">Aucune note.</p>
                  ) : (
                    s.grades.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between rounded-2xl bg-background px-4 py-2.5"
                      >
                        <span className="text-sm font-semibold">{g.label}</span>
                        <span className="text-sm font-bold">{g.score.toFixed(2)}/20</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <input
                    value={entry.label}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [s.id]: { ...entry, label: e.target.value } }))
                    }
                    placeholder="Intitulé (ex. Devoir 1)"
                    className="min-w-40 flex-1 rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none"
                  />
                  <input
                    value={entry.score}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [s.id]: { ...entry, score: e.target.value } }))
                    }
                    inputMode="decimal"
                    placeholder="Note /20"
                    className="w-28 rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none"
                  />
                  <button
                    onClick={() => addGrade.mutate(s.id)}
                    disabled={addGrade.isPending}
                    className="clay rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
