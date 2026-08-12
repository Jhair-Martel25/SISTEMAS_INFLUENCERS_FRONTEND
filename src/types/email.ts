export interface EnviarEmailRequest {
  influencerId: string;
  plantillaId: string;
}

export interface EnviarEmailResponse {
  influencerId: string;
  email: string;
  exitoso: boolean;
  error?: string;
}