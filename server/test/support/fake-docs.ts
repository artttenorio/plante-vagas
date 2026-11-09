/**
 * Geradores de CPF/CNPJ validos (algoritmo mod11) so para popular fixtures
 * dos testes de seguranca — nao sao documentos reais.
 */
function digitoCPF(digitos: number[], peso: number): number {
  const soma = digitos.reduce((acc, d, i) => acc + d * (peso - i), 0);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

export function gerarCPF(seed: number): string {
  const base = String(seed % 1000000000).padStart(9, '0').split('').map(Number);
  const d1 = digitoCPF(base, 10);
  const d2 = digitoCPF([...base, d1], 11);
  return [...base, d1, d2].join('');
}

function digitoCNPJ(digitos: number[], pesos: number[]): number {
  const soma = digitos.reduce((acc, d, i) => acc + d * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function gerarCNPJ(seed: number): string {
  const base = String(seed % 100000000).padStart(8, '0').split('').map(Number).concat([0, 0, 0, 1]);
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = digitoCNPJ(base, pesos1);
  const d2 = digitoCNPJ([...base, d1], pesos2);
  return [...base, d1, d2].join('');
}
