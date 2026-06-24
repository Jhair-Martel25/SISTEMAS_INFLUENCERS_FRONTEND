export function LeftPanel() {
  return (
    <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: "url('/images/login-background.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#003D2D]/95 via-[#003D2D]/80 to-[#01281E]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(32,209,143,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(32,209,143,0.1),transparent_50%)]" />
      <div className="relative z-10 flex flex-col justify-end p-12 pb-16 text-white w-full">
        <div className="backdrop-blur-sm bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#20D18F] to-[#0B5E47] flex items-center justify-center shadow-lg shadow-[#20D18F]/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
            <div className="h-8 w-px bg-white/20" />
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#20D18F] animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-[#20D18F]/60" />
              <span className="w-2 h-2 rounded-full bg-[#20D18F]/30" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Gestiona
            <br />
            influencers
            <br />
            de impacto social
          </h2>
          <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-lg">
            Automatiza validaciones, campañas, agendas y seguimiento con nuestra
            plataforma inteligente diseñada para el cambio.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-8 ml-2">
          <span className="w-8 h-2 rounded-full bg-white" />
          <span className="w-2 h-2 rounded-full bg-white/40" />
          <span className="w-2 h-2 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  )
}
