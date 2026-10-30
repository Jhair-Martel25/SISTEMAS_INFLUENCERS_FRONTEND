import { apiClient } from '@/lib/http'
import type {
  ActualizarContactoEmpresaInput,
  ActualizarEmpresaInput,
  ContactoEmpresa,
  CrearContactoEmpresaInput,
  CrearEmpresaInput,
  Empresa,
  EmpresaBusqueda,
  EmpresaBusquedaFiltros,
} from '@/types/empresa'

const BASE_PATH = '/empresas'

export const empresasService = {
  /** Buscar empresas por nombre, RUC o CIIU (GET /empresas/buscar). */
  async buscar(filtros?: EmpresaBusquedaFiltros): Promise<EmpresaBusqueda[]> {
    return apiClient.get<EmpresaBusqueda[]>(`${BASE_PATH}/buscar`, {
      params: { q: filtros?.q, limite: filtros?.limite },
    })
  },

  /** Obtener una empresa por RUC (GET /empresas/por-ruc/:ruc). */
  async obtenerPorRuc(ruc: string): Promise<Empresa> {
    return apiClient.get<Empresa>(
      `${BASE_PATH}/por-ruc/${encodeURIComponent(ruc)}`,
    )
  },

  /** Detalle de una empresa con sus contactos. */
  async obtenerPorId(id: string): Promise<Empresa> {
    return apiClient.get<Empresa>(`${BASE_PATH}/${id}`)
  },

  /** Registrar manualmente una empresa. */
  async crear(input: CrearEmpresaInput): Promise<Empresa> {
    return apiClient.post<Empresa>(BASE_PATH, input)
  },

  /** Actualizar los datos de una empresa. */
  async actualizar(
    id: string,
    input: ActualizarEmpresaInput,
  ): Promise<Empresa> {
    return apiClient.patch<Empresa>(`${BASE_PATH}/${id}`, input)
  },

  /** Contactos/funcionarios de una empresa. */
  async listarContactos(empresaId: string): Promise<ContactoEmpresa[]> {
    return apiClient.get<ContactoEmpresa[]>(
      `${BASE_PATH}/${empresaId}/contactos`,
    )
  },

  async crearContacto(
    empresaId: string,
    input: CrearContactoEmpresaInput,
  ): Promise<ContactoEmpresa> {
    return apiClient.post<ContactoEmpresa>(
      `${BASE_PATH}/${empresaId}/contactos`,
      input,
    )
  },

  async actualizarContacto(
    contactoId: string,
    input: ActualizarContactoEmpresaInput,
  ): Promise<ContactoEmpresa> {
    return apiClient.patch<ContactoEmpresa>(
      `${BASE_PATH}/contactos/${contactoId}`,
      input,
    )
  },

  async eliminarContacto(contactoId: string): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/contactos/${contactoId}`)
  },
}
