/**
 * Helpers pra regra "processo seletivo não começa no passado".
 * Trabalham sempre com a string "YYYY-MM-DD" que o <input type="date"> usa —
 * comparar essas strings é comparação de data pura, sem fuso nem horário
 * atrapalhando (que é o que acontece se passar por new Date()).
 */

export function hojeISO(): string {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${hoje.getFullYear()}-${mes}-${dia}`;
}

/**
 * Menor data que o calendário deve deixar escolher. Normalmente é hoje, mas
 * se o processo já estava salvo com uma data passada (as vagas antigas têm
 * dataInicio retroalimentado com a data de criação da vaga), essa data
 * continua selecionável — senão não dava pra editar mais nada do processo
 * sem ser obrigado a mudar a data junto.
 */
export function dataInicioMinima(dataSalva?: string): string {
  const hoje = hojeISO();
  if (dataSalva && dataSalva < hoje) return dataSalva;
  return hoje;
}

/**
 * Maior data que o calendário deve aceitar: espelha o limite de 5 anos que
 * a API já aplica (`IsNotAbsurdlyFarInFuture(5)`). Sem isso, uma data
 * absurda (ex: 2999) só era recusada na hora de publicar a vaga, numa tela
 * diferente da onde foi digitada, com mensagem técnica (BUG058).
 */
export function dataInicioMaxima(): string {
  const limite = new Date();
  limite.setFullYear(limite.getFullYear() + 5);
  const mes = String(limite.getMonth() + 1).padStart(2, "0");
  const dia = String(limite.getDate()).padStart(2, "0");
  return `${limite.getFullYear()}-${mes}-${dia}`;
}

/** Mensagem de erro, ou "" se a data está válida. */
export function validarDataInicio(dataInicio: string, dataSalva?: string): string {
  if (!dataInicio) return "A data de início é obrigatória.";
  if (dataInicio < dataInicioMinima(dataSalva)) {
    return "A data de início não pode ser anterior a hoje.";
  }
  if (dataInicio > dataInicioMaxima()) {
    return "A data de início não pode estar a mais de 5 anos no futuro.";
  }
  return "";
}
