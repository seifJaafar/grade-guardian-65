import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type CourseGrades = {
  courseId: string;
  code: string;
  name: string;
  grades: { id: string; label: string; score: number }[];
};

export function StudentView({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["student-courses", userId],
    queryFn: async (): Promise<CourseGrades[]> => {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id, courses(id, code, name)")
        .eq("student_id", userId);

      const { data: grades } = await supabase
        .from("grades")
        .select("id, course_id, label, score")
        .eq("student_id", userId);

      return (enrollments ?? []).map((e) => {
        const course = e.courses as { id: string; code: string; name: string } | null;
        return {
          courseId: e.course_id,
          code: course?.code ?? "",
          name: course?.name ?? "Cours",
          grades: (grades ?? [])
            .filter((g) => g.course_id === e.course_id)
            .map((g) => ({ id: g.id, label: g.label, score: Number(g.score) })),
        };
      });
    },
  });

  if (isLoading) {
    return <p className="text-sm font-semibold text-muted-foreground">Chargement des notes…</p>;
  }

  const courses = data ?? [];

  return (
    <section>
      <h1 className="mb-6 font-display text-3xl font-semibold">Mes notes par cours</h1>
      {courses.length === 0 ? (
        <div className="clay rounded-[2rem] bg-card p-8 text-sm font-semibold text-muted-foreground">
          Vous n'êtes inscrit à aucun cours pour le moment.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {courses.map((course) => {
            const average =
              course.grades.length > 0
                ? course.grades.reduce((sum, g) => sum + g.score, 0) / course.grades.length
                : null;
            return (
              <div key={course.courseId} className="clay rounded-3xl bg-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      {course.code}
                    </p>
                    <h2 className="font-display text-xl font-semibold">{course.name}</h2>
                  </div>
                  <span className="rounded-full bg-mint/30 px-3 py-1 text-sm font-bold">
                    {average !== null ? `${average.toFixed(2)}/20` : "—"}
                  </span>
                </div>
                <div className="mt-4 grid gap-2">
                  {course.grades.length === 0 ? (
                    <p className="text-sm font-semibold text-muted-foreground">
                      Aucune note publiée.
                    </p>
                  ) : (
                    course.grades.map((g) => (
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
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
