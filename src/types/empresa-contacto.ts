import type { Influencer } from './influencer'
export interface ContactoEmpresa {
  id: string; nombres: string; apellidos?: string | null; cargo?: string | null; email?: string | null; telefono?: string | null; telefonos?: string[]; fax?: string | null; ubigeo?: string | null; paginaWeb?: string | null; direccion?: string | null; estadoCorreo?: 'PENDIENTE' | 'ENVIADO' | 'REBOTADO'; ultimoCorreoEnviadoAt?: string | null; influencerId?: string | null; createdAt?: string; updatedAt?: string
}
export interface Empresa {
  id: string; nombre: string; nombreEmbajador?: string; ruc?: string | null; sector?: string | null; direccion?: string | null; sitioWeb?: string | null; descripcion?: string | null; contactos: ContactoEmpresa[]; redSocial?: string; usuarioIg?: string; estadoValidacion?: string
}
export type CrearContactoInput = { nombres: string; apellidos: string; cargo: string; email: string; telefonos: string[]; ubigeo: string; paginaWeb: string; direccion: string; fax?: string }
export type ActualizarContactoInput = Partial<CrearContactoInput>
export type ActualizarEmpresaInput = Partial<Pick<Empresa, 'nombre' | 'ruc' | 'sector' | 'direccion' | 'sitioWeb' | 'descripcion'>>
export type CrearEmpresaInput = never
export type EmbajadorEmpresa = Influencer
