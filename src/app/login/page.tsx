import { LeftPanel } from "@/components/login/LeftPanel";
import { LoginForm } from "@/components/login/LoginForm";
import { LoginFooter } from "@/components/login/LoginFooter";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      <LeftPanel />
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-[450px] px-8 py-12 flex flex-col min-h-screen md:min-h-0">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003D2D] to-[#0B5E47] flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 2a10 10 0 0 1 7.07 17.07A10 10 0 0 1 4.93 4.93 10 10 0 0 1 12 2z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-[#003D2D] tracking-tight">
                Sembrando Perú
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">Bienvenido</h1>
            <p className="text-gray-500 mt-2 text-sm">
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
