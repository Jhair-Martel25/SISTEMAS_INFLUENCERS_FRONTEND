"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  rolesPermitidos: string[];
  children: React.ReactNode;
}

export default function RutaProtegida({ rolesPermitidos, children }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const rolNoPermitido = !isLoading && isAuthenticated && user && !rolesPermitidos.includes(user.role);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (rolNoPermitido) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, rolNoPermitido, router]);

  if (isLoading || !isAuthenticated || rolNoPermitido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-[#003D2D] border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}