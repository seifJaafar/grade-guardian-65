import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/AppShell";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scolaria — Plateforme de gestion de notes" },
      {
        name: "description",
        content:
          "Scolaria relie étudiants, enseignants et superviseurs autour d'un espace simple pour suivre et saisir les notes.",
      },
      { property: "og:title", content: "Scolaria — Plateforme de gestion de notes" },
      {
        property: "og:description",
        content: "Suivez les notes cours par cours, côté étudiant, enseignant et superviseur.",
      },
    ],
  }),
  component: Index,
});

const previewRows = [
  { name: "Lina Benali", topic: "Algèbre & Fonctions", mark: "18/20", avatar: avatar1 },
  { name: "Yassine El Amrani", topic: "Géométrie", mark: "14/20", avatar: avatar2 },
  { name: "Sofia Mansouri", topic: "Statistiques", mark: "19/20", avatar: avatar3 },
];

function Index() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <nav className="mb-12 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/auth" className="clay rounded-full bg-card px-5 py-2.5 text-sm font-bold">
              Se connecter
            </Link>
            <Link
              to="/auth"
              className="clay rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground"
            >
              S'inscrire
            </Link>
          </div>
        </nav>

        <section className="mb-14 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="clay inline-block rounded-full bg-mint/40 px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
              Plateforme de gestion de notes
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] font-semibold sm:text-6xl">
              Vos notes, <br />
              <span className="text-brand">claires</span> et{" "}
              <span className="text-accent">douces</span>, pour toute la classe.
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Scolaria relie étudiants, enseignants et superviseurs autour d'un espace simple,
              chaleureux et sans friction.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="clay rounded-2xl bg-brand px-7 py-3.5 font-bold text-brand-foreground"
              >
                Commencer gratuitement
              </Link>
              <Link to="/auth" className="clay rounded-2xl bg-card px-7 py-3.5 font-bold">
                Voir un démo
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-5 text-sm font-semibold text-muted-foreground">
              <span>3 rôles</span>
              <span className="size-1.5 rounded-full bg-accent" />
              <span>Notes cours par cours</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="clay mx-auto w-full max-w-sm rounded-[2rem] bg-card p-7">
            <div className="mb-6 flex items-center gap-1 rounded-full bg-background p-1 text-sm font-bold">
              <span className="flex-1 rounded-full bg-brand py-2 text-center text-brand-foreground">
                Connexion
              </span>
              <Link
                to="/auth"
                className="flex-1 rounded-full py-2 text-center text-muted-foreground"
              >
                Inscription
              </Link>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse e-mail"
                className="w-full rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none placeholder:text-muted-foreground"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={loading}
                className="clay w-full rounded-2xl bg-brand py-3 font-bold text-brand-foreground disabled:opacity-60"
              >
                {loading ? "Patientez…" : "Se connecter"}
              </button>
            </div>
            {error ? (
              <p className="mt-4 text-center text-xs font-semibold text-destructive">{error}</p>
            ) : null}
            <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
              Nouveau ? Créez un compte en 30 secondes
            </p>
          </form>
        </section>

        <section className="mb-14">
          <h2 className="mb-6 font-display text-3xl font-semibold">
            Trois espaces, un même tableau de bord
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="clay rounded-3xl bg-card p-6">
              <div className="clay grid size-14 place-items-center rounded-2xl bg-brand/15 font-display text-2xl font-semibold text-brand">
                É
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">Étudiant</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Suivez vos notes cours par cours et votre progression.
              </p>
            </div>
            <div className="clay rounded-3xl bg-card p-6">
              <div className="clay grid size-14 place-items-center rounded-2xl bg-accent/20 font-display text-2xl font-semibold text-accent">
                T
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">Enseignant</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Gérez vos cours et saisissez les notes de chaque élève.
              </p>
            </div>
            <div className="clay rounded-3xl bg-card p-6">
              <div className="clay grid size-14 place-items-center rounded-2xl bg-mint/30 font-display text-2xl font-semibold">
                S
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">Superviseur</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Validez les demandes d'inscription et gardez l'œil.
              </p>
            </div>
          </div>
        </section>

        <section className="clay rounded-[2.5rem] bg-card p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Aperçu enseignant
              </p>
              <h2 className="font-display text-2xl font-semibold">Mathématiques — 3e année</h2>
            </div>
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-bold text-brand">
              12 élèves
            </span>
          </div>
          <div className="grid gap-3">
            {previewRows.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-[1.4fr_1fr_auto] items-center gap-3 rounded-2xl bg-background px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={row.avatar}
                    alt={row.name}
                    loading="lazy"
                    width={816}
                    height={816}
                    className="size-10 rounded-full bg-muted object-cover"
                  />
                  <span className="font-bold">{row.name}</span>
                </div>
                <div className="text-sm font-semibold text-muted-foreground">{row.topic}</div>
                <span className="rounded-full bg-mint/30 px-3 py-1 text-sm font-bold">
                  {row.mark}
                </span>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-muted-foreground">
          <span>© 2026 Scolaria — Conçu avec douceur.</span>
          <span>Confiance · Simplicité · Chaleur</span>
        </footer>
      </div>
    </div>
  );
}
