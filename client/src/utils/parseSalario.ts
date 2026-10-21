/**
 * Converte o texto digitado no campo salário (formato brasileiro, com "R$",
 * ponto de milhar e vírgula decimal) pra número. Retorna `null` quando o
 * texto não é um valor válido (letras, negativo, zero, ou texto vazio) — a
 * tela decide o que fazer com isso (bloquear o envio e avisar o usuário),
 * em vez de mandar NaN/undefined pro backend e publicar "A combinar" em
 * silêncio.
 */
export function parseSalarioBR(raw: string): number | null {
  const semMoeda = raw.replace(/^\s*R\$\s*/i, "").trim();
  if (!semMoeda) return null;

  // Só aceita dígitos com ponto de milhar (ex: 2.500) e vírgula decimal
  // opcional (ex: 2.500,50) — qualquer outro caractere (letras, "-", "R$"
  // solto etc.) é formato inválido.
  const formatoValido = /^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(semMoeda);
  if (!formatoValido) return null;

  const normalizado = semMoeda.replace(/\./g, "").replace(",", ".");
  const valor = parseFloat(normalizado);
  if (!Number.isFinite(valor) || valor <= 0) return null;
  return valor;
}
