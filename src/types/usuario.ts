export type EstadoUsuario = "ACTIVO" | "INACTIVO";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  estado: EstadoUsuario;
  roleId: number;
  createdAt?: string;
}

export interface CrearUsuarioInput {
  email: string;
  nombre: string;
  roleId: number;
}

export interface ActualizarUsuarioInput {
  email?: string;
  nombre?: string;
  roleId?: number;
}

export interface UsuarioFiltros {
  page?: number;
  limit?: number;
  estado?: EstadoUsuario;
  roleId?: number;
}

export interface UsuariosResponse {
  data: Usuario[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}