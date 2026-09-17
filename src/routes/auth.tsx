import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/AppShell";
import type { AppRole } from "@/hooks/useAuthProfile";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion & inscription — Scolaria" },
      {
        name: "description",
        content:
          "Connectez-vous à Scolaria ou créez un compte étudiant, enseignant ou superviseur.",
      },
      { property: "og:title", content: "Connexion & inscription — Scolaria" },
      {
        property: "og:description",
        content: "Accédez à votre espace de gestion de notes Scolaria.",
      },
    ],
  }),
  component: AuthPage,
});

const roles: { value: AppRole; label: string; hint: string }[] = [
  { value: "etudiant", label: "Étudiant", hint: "Consulter mes notes par cours" },
  { value: "enseignant", label: "Enseignant", hint: "Gérer mes cours et les notes" },
  { value: "superviseur", label: "Superviseur", hint: "Valider les inscriptions" },
];

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("etudiant");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      if (!data.user) {
        setMessage("Vérifiez votre boîte mail pour confirmer votre compte.");
        return;
      }
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email,
        requested_role: role,
      });
      if (profileError) throw profileError;
      navigate({ to: "/dashboard" });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <nav className="mb-12 flex items-center justify-between">
          <Logo />
          <Link to="/" className="clay rounded-full bg-card px-5 py-2.5 text-sm font-bold">
            Retour à l'accueil
          </Link>
        </nav>

        <div className="mx-auto max-w-md">
          <h1 className="mb-6 text-center font-display text-3xl font-semibold">
            {mode === "login" ? "Content de vous revoir" : "Créez votre compte"}
          </h1>

          <form onSubmit={handleSubmit} className="clay rounded-[2rem] bg-card p-7">
            <div className="mb-6 flex items-center gap-1 rounded-full bg-background p-1 text-sm font-bold">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-full py-2 ${
                  mode === "login" ? "bg-brand text-brand-foreground" : "text-muted-foreground"
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-full py-2 ${
                  mode === "signup" ? "bg-brand text-brand-foreground" : "text-muted-foreground"
                }`}
              >
                Inscription
              </button>
            </div>

            <div className="space-y-3">
              {mode === "signup" ? (
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Nom complet"
                  className="w-full rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none placeholder:text-muted-foreground"
                />
              ) : null}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Adresse e-mail"
                className="w-full rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none placeholder:text-muted-foreground"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mot de passe"
                className="w-full rounded-2xl bg-background px-4 py-3 text-sm font-semibold outline-none placeholder:text-muted-foreground"
              />

              {mode === "signup" ? (
                <div className="grid gap-2 pt-1">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`rounded-2xl px-4 py-3 text-left ${
                        role === r.value
                          ? "bg-brand text-brand-foreground"
                          : "bg-background text-foreground"
                      }`}
                    >
                      <span className="block text-sm font-bold">{r.label}</span>
                      <span className="block text-xs opacity-70">{r.hint}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="clay w-full rounded-2xl bg-brand py-3 font-bold text-brand-foreground disabled:opacity-60"
              >
                {loading
                  ? "Patientez…"
                  : mode === "login"
                    ? "Se connecter"
                    : "Envoyer ma demande"}
              </button>
            </div>

            {message ? (
              <p className="mt-4 text-center text-xs font-semibold text-destructive">{message}</p>
            ) : null}

            <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
              {mode === "login"
                ? "Nouveau ? Créez un compte en 30 secondes"
                : "Votre compte sera activé après validation du superviseur"}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
