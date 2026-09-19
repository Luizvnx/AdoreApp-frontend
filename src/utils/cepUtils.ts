export const WEEKDAY_OPTIONS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
] as const;

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Formata o CEP para a máscara 00000-000
 */
export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Limpa o CEP mantendo apenas os 8 dígitos numéricos
 */
export function cleanCep(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8);
}

/**
 * Consulta informações de endereço a partir do CEP via ViaCEP
 */
export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const digits = cleanCep(cep);
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;
    const data: ViaCepResponse = await response.json();
    if (data.erro) return null;
    return data;
  } catch (error) {
    console.error('Erro ao consultar ViaCEP:', error);
    return null;
  }
}
