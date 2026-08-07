export type TipoPlantilla = 'correo' | 'mensaje-ig' | 'whatsapp'

export interface Plantilla {
  id: string;
  nombre: string;
  asunto?: string;
  contenido: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearPlantillaInput {
  nombre: string;
  asunto?: string;
  contenido: string;
}

export type ActualizarPlantillaInput = Partial<CrearPlantillaInput>;
