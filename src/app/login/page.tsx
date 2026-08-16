import { Clock } from "lucide-react";
import { LeftPanel } from "@/features/auth/components/login/LeftPanel";
import { LoginForm } from "@/features/auth/components/login/LoginForm";
import { LoginFooter } from "@/features/auth/components/login/LoginFooter";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      <LeftPanel />
      <div className="w-full md:w-1/2 flex items-center justify-center bg-card">
        <div className="w-full max-w-[450px] px-8 py-12 flex flex-col min-h-screen md:min-h-0">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-dark to-primary flex items-center justify-center shadow-lg">
                <Clock className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-brand-dark tracking-tight">
                Sembrando Perú
              </span>
            </div>

            <h1 className="text-3xl font-bold text-foreground">Bienvenido</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Ingresa tus credenciales para acceder a la plataforma.
            </p>
          </div>

          <LoginForm />

          <LoginFooter />
        </div>
      </div>
    </main>
  );
}
