export interface UbigeoItem {
  codigo: string
  departamento: string
  provincia: string
  distrito?: string
  etiqueta: string
}

export interface Departamento {
  codigo: string
  nombre: string
}

export interface Provincia {
  codigo: string
  nombre: string
  departamentoId: string
  departamento: string
}

export interface Distrito {
  codigo: string
  distrito: string
  provinciaId: string
  provincia: string
  departamentoId: string
  departamento: string
  etiqueta: string
}
