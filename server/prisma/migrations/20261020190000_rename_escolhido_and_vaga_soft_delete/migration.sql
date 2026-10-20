-- RENAME, não DROP+ADD: preserva os 299 valores já gravados em
-- CandidatoEtapa.escolhido. O Prisma, nesse caso, sugeriu um DROP COLUMN
-- seguido de ADD COLUMN (ele não detecta rename de campo sozinho), o que
-- apagaria todo esse dado — escrita à mão de propósito.
ALTER TABLE "CandidatoEtapa" RENAME COLUMN "escolhido" TO "selecionado";

-- Soft delete de Vaga: "excluir vaga" passa a marcar esta data em vez de
-- apagar a linha, preservando candidaturas e histórico.
ALTER TABLE "Vaga" ADD COLUMN "deletedAt" TIMESTAMP(3);
