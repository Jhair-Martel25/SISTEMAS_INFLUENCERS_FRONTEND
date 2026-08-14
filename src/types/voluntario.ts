export interface Voluntario {
  id: string
  nombre: string
  email: string
  estado: 'ACTIVO' | 'INACTIVO'
  roleId: number
  createdAt?: string
}

export interface VoluntarioFiltros {
  page?: number
  limit?: number
  estado?: string
  roleId?: number
}

export interface VoluntariosPaginados {
  data: Voluntario[]
  meta: {
    total: number
    page: number
    limit: number
  }
}