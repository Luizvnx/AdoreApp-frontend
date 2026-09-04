/**
 * Sanitiza e valida URLs ou Data URLs de imagem no cliente para prevenir XSS,
 * scripts maliciosos e estresse de renderização.
 */
export function validateAndSanitizeImage(url: string | null | undefined, maxSizeBytes = 700 * 1024): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // 1. Limite de tamanho de Payload (Prevenir travamento de renderização)
  if (trimmed.length > maxSizeBytes) {
    return null;
  }

  // 2. Prevenção de XSS e protocolos perigosos
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/') ||
    lower.startsWith('data:application/') ||
    lower.includes('<script') ||
    lower.includes('onload=') ||
    lower.includes('onerror=')
  ) {
    return null;
  }

  // 3. Validação de Mime-Type para Data URLs
  if (lower.startsWith('data:')) {
    const isSafeDataUrl = /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed);
    if (!isSafeDataUrl) {
      return null;
    }
    return trimmed;
  }

  // 4. Validação de URLs HTTP / HTTPS
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (['http:', 'https:'].includes(parsed.protocol)) {
        return parsed.href;
      }
    } catch {
      return null;
    }
  }

  // 5. Caminhos de arquivos relativos seguros
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  return null;
}
