import { UI_MESSAGES } from '../constants/messages';

/**
 * Extrai a mensagem de erro da resposta da API de forma segura.
 * Se houver vestígios de erros do Prisma, caminhos de arquivos ou exceções não tratadas,
 * sanitiza e exibe a mensagem amigável (fallback) sem expor detalhes do sistema/código.
 */
export function getApiErrorMessage(error: any, fallback: string = UI_MESSAGES.ERRORS.GENERIC): string {
  const rawMessage = error?.response?.data?.error || error?.message || '';

  if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) {
    const lower = rawMessage.toLowerCase();
    const isLeak =
      lower.includes('prisma') ||
      lower.includes('invocation in') ||
      lower.includes('d:\\') ||
      lower.includes('c:\\') ||
      lower.includes('/src/') ||
      lower.includes('typeerror') ||
      lower.includes('referenceerror') ||
      lower.includes('econnrefused') ||
      lower.includes('postgresql');

    if (!isLeak) {
      return rawMessage;
    }
  }

  return fallback;
}

