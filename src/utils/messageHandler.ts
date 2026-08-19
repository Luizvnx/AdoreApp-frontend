import { UI_MESSAGES } from '../constants/messages';

/**
 * Extrai a mensagem de erro da resposta da API de forma segura.
 * Se não houver mensagem na API, retorna o fallback fornecido.
 */
export function getApiErrorMessage(error: any, fallback: string = UI_MESSAGES.ERRORS.GENERIC): string {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }

  return fallback;
}
