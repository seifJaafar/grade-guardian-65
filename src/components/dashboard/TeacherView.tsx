import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function TeacherView({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-courses", userId],
    queryFn: async () => {
      const { data: courses } = await supabase
        .from("courses")
        .select("id, code, name")
        .eq("teacher_id", userId)
        .order("name");

      const { data: enrollments } = await supabase.from("enrollments").select("course_id");

      return (courses ?? []).map((c) => ({
        ...c,
        students: (enrollments ?? []).filter((e) => e.course_id === c.id).length,
      }));
    },
  });

  if (isLoading) {
    return <p className="text-sm font-semibold text-muted-foreground">Chargement des cours…</p>;
  }

  const courses = data ?? [];

  return (
    <section>
      <h1 className="mb-6 font-display text-3xl font-semibold">Mes cours</h1>
      {courses.length === 0 ? (
        <div className="clay rounded-[2rem] bg-card p-8 text-sm font-semibold text-muted-foreground">
          Aucun cours ne vous est attribué. Le superviseur peut vous en assigner.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              to="/cours/$courseId"
              params={{ courseId: course.id }}
              className="clay block rounded-3xl bg-card p-6"
            >
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {course.code}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold">{course.name}</h2>
              <span className="mt-4 inline-block rounded-full bg-brand/10 px-3 py-1 text-sm font-bold text-brand">
                {course.students} élève{course.students > 1 ? "s" : ""}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
