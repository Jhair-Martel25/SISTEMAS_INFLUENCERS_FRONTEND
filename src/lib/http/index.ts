/**
 * Cliente HTTP de la aplicación.
 *
 * Re-exporta la instancia única (`apiClient`) y los tipos de `http-base`
 * para que los services/features importen desde un único punto:
 *   `import { apiClient, ApiError } from '@/lib/http'`
 */

import { ApiError, HttpBase } from './http-base'

export const apiClient = new HttpBase()

export type { RequestOptions } from './http-base'
export { ApiError }
