-- AlterTable
ALTER TABLE "CandidatoEtapa" ADD COLUMN     "resultadoNotificado" BOOLEAN NOT NULL DEFAULT false;

-- Antes desta migration o candidato rejeitado era avisado na hora em que a
-- empresa clicava em "Rejeitar" — esses já receberam a mensagem e não podem
-- ser avisados de novo quando a etapa deles for fechada.
UPDATE "CandidatoEtapa" SET "resultadoNotificado" = true WHERE "rejeitado" = true;
