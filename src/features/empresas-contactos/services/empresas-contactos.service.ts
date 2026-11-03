import { apiClient } from '@/lib/http'
import type { ActualizarContactoInput, ActualizarEmpresaInput, ContactoEmpresa, CrearContactoInput, Empresa } from '@/types/empresa-contacto'

const BASE_PATH = '/empresas'

export const empresasContactosService = {
  listar(buscar?: string): Promise<Empresa[]> {
    return apiClient.get<Empresa[]>(BASE_PATH, { params: { buscar: buscar || undefined } })
  },
  obtener(id: string): Promise<Empresa> {
    return apiClient.get<Empresa>(`${BASE_PATH}/${id}`)
  },
  actualizar(id: string, input: ActualizarEmpresaInput): Promise<Empresa> {
    return apiClient.patch<Empresa>(`${BASE_PATH}/${id}`, input)
  },
  crearContacto(empresaId: string, input: CrearContactoInput): Promise<ContactoEmpresa> {
    return apiClient.post<ContactoEmpresa>(`${BASE_PATH}/${empresaId}/contactos`, input)
  },
  actualizarContacto(id: string, input: ActualizarContactoInput): Promise<ContactoEmpresa> {
    return apiClient.patch<ContactoEmpresa>(`/contactos/${id}`, input)
  },
  eliminarContacto(id: string): Promise<void> {
    return apiClient.delete<void>(`/contactos/${id}`)
  },
  enviarCorreoContacto(input: { email: string; nombreDestino: string; asunto: string; mensaje: string }): Promise<{ exitoso: boolean; email: string }> {
    return apiClient.post('/email/enviar-contacto', input)
  },
  enviarCorreosEmpresariales(input: {
    contactoIds?: string[]
    empresaIds?: string[]
    asunto: string
    contenido: string
    plantillaId?: string
  }): Promise<{ id: string; contactoId?: string; tipo?: 'CONTACTO' | 'EMPRESA'; email: string; exitoso: boolean; error?: string }[]> {
    return apiClient.post('/email/enviar-correos-empresariales', input)
  },
}
