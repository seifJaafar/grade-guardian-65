import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuthProfile, roleLabel } from "@/hooks/useAuthProfile";
import { StudentView } from "@/components/dashboard/StudentView";
import { TeacherView } from "@/components/dashboard/TeacherView";
import { SupervisorView } from "@/components/dashboard/SupervisorView";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Mon espace — Scolaria" },
      { name: "description", content: "Votre tableau de bord Scolaria selon votre rôle." },
      { property: "og:title", content: "Mon espace — Scolaria" },
      { property: "og:description", content: "Notes, cours et validations au même endroit." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useAuthProfile();

  if (isLoading) {
    return (
      <AppShell>
        <p className="text-sm font-semibold text-muted-foreground">Chargement…</p>
      </AppShell>
    );
  }

  if (!data?.profile) {
    return (
      <AppShell>
        <div className="clay rounded-[2rem] bg-card p-8">
          <h1 className="font-display text-2xl font-semibold">Profil incomplet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aucun profil n'est associé à ce compte. Créez un nouveau compte depuis la page
            d'inscription.
          </p>
        </div>
      </AppShell>
    );
  }

  if (data.profile.status !== "approved" || !data.role) {
    return (
      <AppShell subtitle={`Demande : ${roleLabel[data.profile.requested_role]}`}>
        <div className="clay mx-auto max-w-lg rounded-[2rem] bg-card p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">
            {data.profile.status === "rejected"
              ? "Demande refusée"
              : "Demande en attente de validation"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {data.profile.status === "rejected"
              ? "Un superviseur a refusé votre demande d'inscription."
              : "Un superviseur doit valider votre inscription avant l'accès à votre espace."}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell subtitle={roleLabel[data.role]}>
      {data.role === "etudiant" ? <StudentView userId={data.userId} /> : null}
      {data.role === "enseignant" ? <TeacherView userId={data.userId} /> : null}
      {data.role === "superviseur" ? <SupervisorView /> : null}
    </AppShell>
  );
}
