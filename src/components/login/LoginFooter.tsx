export function LoginFooter() {
  return (
    <footer className="mt-auto pt-8">
      <div className="flex flex-col items-center gap-3 text-xs text-gray-400">
        <p>Sembrando Perú &copy; {new Date().getFullYear()}</p>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="hover:text-[#003D2D] transition-colors duration-200"
          >
            Políticas de Privacidad
          </a>
          <span className="w-px h-3 bg-gray-300" />
          <a
            href="#"
            className="hover:text-[#003D2D] transition-colors duration-200"
          >
            Términos de Servicio
          </a>
          <span className="w-px h-3 bg-gray-300" />
          <a
            href="#"
            className="hover:text-[#003D2D] transition-colors duration-200"
          >
            Ayuda
          </a>
        </div>
      </div>
    </footer>
  )
}
