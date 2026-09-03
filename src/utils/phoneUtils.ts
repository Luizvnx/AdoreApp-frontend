/**
 * Utilitários para formatação, máscara e sanitização de números de telefone/WhatsApp.
 */

/**
 * Aplica máscara visual de telefone brasileiro enquanto o usuário digita:
 * Ex: (79) 99845-7535 ou (79) 3211-0000
 */
export function maskPhoneNumber(value: string | null | undefined): string {
  if (!value) return '';

  // Remove tudo que não for dígito
  let digits = value.replace(/\D/g, '');

  // Se o usuário colou com DDI 55 (ex: 5579998457535) e tem mais de 11 dígitos, remove o 55 para exibição amigável
  if (digits.startsWith('55') && digits.length >= 12) {
    digits = digits.slice(2);
  }

  // Remove zeros à esquerda no DDD (ex: 079... -> 79...)
  if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }

  // Limita ao tamanho máximo de celular brasileiro (11 dígitos)
  if (digits.length > 11) {
    digits = digits.slice(0, 11);
  }

  // Aplica a máscara dinamicamente
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Sanitiza e formata o número de telefone no formato internacional exigido pela Evolution API / WhatsApp (E.164).
 * Ex: (79) 99845-7535 -> 5579998457535
 */
export function formatWhatsAppNumber(phone: string | null | undefined): string {
  if (!phone) return '';

  let digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // Remove zeros à esquerda
  if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }

  // Se tiver 10 dígitos (DDD + 8 dígitos móvel sem 9)
  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const firstMobile = digits[2];
    if (['6', '7', '8', '9'].includes(firstMobile)) {
      digits = `${ddd}9${digits.slice(2)}`;
    }
    return `55${digits}`;
  }

  // Se tiver 11 dígitos (DDD + 9 dígitos)
  if (digits.length === 11) {
    return `55${digits}`;
  }

  // Se tiver 12 dígitos e começar com 55 (55 + DDD + 8 dígitos)
  if (digits.startsWith('55') && digits.length === 12) {
    const ddd = digits.slice(2, 4);
    const firstMobile = digits[4];
    if (['6', '7', '8', '9'].includes(firstMobile)) {
      return `55${ddd}9${digits.slice(4)}`;
    }
    return digits;
  }

  // Se já tiver DDI 55 + 11 dígitos (13 dígitos total)
  if (digits.startsWith('55') && digits.length === 13) {
    return digits;
  }

  // Outros casos / Internacionais
  if (!digits.startsWith('55') && digits.length >= 10 && digits.length <= 15) {
    return `55${digits}`;
  }

  return digits;
}

/**
 * Gera URL direta para conversa no WhatsApp (wa.me)
 */
export function formatWhatsAppUrl(phone: string | null | undefined, message?: string): string | null {
  const formatted = formatWhatsAppNumber(phone);
  if (!formatted || formatted.length < 10) return null;

  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${formatted}${encodedMessage}`;
}
