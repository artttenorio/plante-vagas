/**
 * Formata telefone brasileiro: "DDD XXXX-XXXX" (fixo, 10 dígitos) ou
 * "DDD XXXXX-XXXX" (celular, 11 dígitos). A versão anterior encadeava
 * regexes não ancoradas que, a partir do 3º dígito, reaplicavam o primeiro
 * replace em qualquer trinca de dígitos no meio da string — por isso
 * "00 90000-0000" virava "00 90 00000-00" (BUG002).
 */
export const phoneMask = (value: string): string => {
  const digitos = value.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `${digitos.slice(0, 2)} ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `${digitos.slice(0, 2)} ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `${digitos.slice(0, 2)} ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
};
