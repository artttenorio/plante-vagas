/**
 * Normaliza texto pra comparação de busca: remove acentos e diacríticos,
 * deixa minúsculo. Mesmo algoritmo de client/src/utils/normalizeText.ts —
 * copiado pro backend porque front e back são processos separados.
 */
export function normalizeText(texto: string): string {
  return Array.from(texto.normalize('NFD'))
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code < 0x0300 || code > 0x036f;
    })
    .join('')
    .toLowerCase();
}
