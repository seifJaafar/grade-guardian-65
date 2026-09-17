import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="clay grid size-11 place-items-center rounded-2xl bg-brand font-display text-lg font-semibold text-brand-foreground">
        S
      </span>
      <span className="font-display text-xl font-semibold">Scolaria</span>
    </Link>
  );
}

export function AppShell({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <nav className="mb-10 flex flex-wrap items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-3">
            {subtitle ? (
              <span className="hidden rounded-full bg-card px-4 py-2 text-sm font-bold text-muted-foreground sm:block">
                {subtitle}
              </span>
            ) : null}
            <button
              onClick={signOut}
              className="clay rounded-full bg-card px-5 py-2.5 text-sm font-bold"
            >
              Se déconnecter
            </button>
          </div>
        </nav>
        {children}
      </div>
    </div>
  );
}
