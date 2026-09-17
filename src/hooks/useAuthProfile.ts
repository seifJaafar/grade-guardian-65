import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "etudiant" | "enseignant" | "superviseur";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  requested_role: AppRole;
  status: string;
};

export function useAuthProfile() {
  return useQuery({
    queryKey: ["auth-profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, email, requested_role, status")
        .eq("id", user.id)
        .maybeSingle();

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      return {
        userId: user.id,
        email: user.email ?? "",
        profile: (profile as Profile | null) ?? null,
        role: (roles?.[0]?.role as AppRole | undefined) ?? null,
      };
    },
  });
}

export const roleLabel: Record<AppRole, string> = {
  etudiant: "Étudiant",
  enseignant: "Enseignant",
  superviseur: "Superviseur",
};
